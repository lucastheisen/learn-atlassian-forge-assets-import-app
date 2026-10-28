import { beforeEach, describe, expect, it, vi } from "vitest";
import { referenceRequest } from "./reference-api";
import {
  type AssetFields,
  ContinueLater,
  ProcessingBudget,
} from "./reference-types";
import { lookupUserByEmail } from "./user-lookup";

vi.mock("./reference-api", () => ({ referenceRequest: vi.fn() }));
const request = vi.mocked(referenceRequest);
const budget = () => new ProcessingBudget();
const user = (accountId: string, active = true) => ({
  accountId,
  accountType: "atlassian",
  active,
});

beforeEach(() => vi.resetAllMocks());
describe("lookupUserByEmail", () => {
  it.each<AssetFields>([
    {},
    { Email: [] },
    { Email: [""] },
    { Email: ["  "] },
  ])("reports missing identity without calling Jira: %j", async (fields) => {
    expect(await lookupUserByEmail(fields, budget())).toEqual({
      status: "unresolved",
      reason: "missing_identity",
    });
    expect(request).not.toHaveBeenCalled();
  });
  it.each([
    { Email: [null] },
    { Email: ["invalid"] },
    { Email: ["a@b.test", "b@b.test"] },
  ])("rejects invalid identity: %j", async (fields) => {
    expect(await lookupUserByEmail(fields, budget())).toEqual({
      status: "unresolved",
      reason: "invalid_identity",
    });
  });
  it("normalizes email and confirms exact matches instead of trusting suggestions", async () => {
    request
      .mockResolvedValueOnce([user("wrong"), user("right")])
      .mockResolvedValueOnce({
        accountId: "wrong",
        email: "different@example.test",
      })
      .mockResolvedValueOnce({
        accountId: "right",
        email: "Person@Example.Test",
      });
    expect(
      await lookupUserByEmail({ Email: [" Person@example.test "] }, budget()),
    ).toEqual({ status: "matched", accountId: "right" });
    expect(request.mock.calls[0]?.[0].value).toContain(
      "query=person%40example.test",
    );
  });
  it("continues pagination and deduplicates suggested accounts", async () => {
    request
      .mockResolvedValueOnce(Array.from({ length: 100 }, () => user("first")))
      .mockResolvedValueOnce({
        accountId: "first",
        email: "different@example.test",
      })
      .mockResolvedValueOnce([user("first"), user("second")])
      .mockResolvedValueOnce({
        accountId: "second",
        email: "person@example.test",
      });
    expect(
      await lookupUserByEmail({ Email: ["person@example.test"] }, budget()),
    ).toEqual({ status: "matched", accountId: "second" });
    expect(request.mock.calls[2]?.[0].value).toContain("startAt=100");
    expect(request).toHaveBeenCalledTimes(4);
  });
  it("leaves ambiguous matches unresolved", async () => {
    request
      .mockResolvedValueOnce([user("a"), user("b")])
      .mockResolvedValueOnce({ accountId: "a", email: "person@example.test" })
      .mockResolvedValueOnce({ accountId: "b", email: "person@example.test" });
    expect(
      await lookupUserByEmail({ Email: ["person@example.test"] }, budget()),
    ).toEqual({ status: "unresolved", reason: "ambiguous" });
  });
  it("does not choose a match while another candidate's email is unavailable", async () => {
    request
      .mockResolvedValueOnce([user("a"), user("b")])
      .mockResolvedValueOnce({ accountId: "a", email: "person@example.test" })
      .mockResolvedValueOnce({ accountId: "b" });
    expect(
      await lookupUserByEmail({ Email: ["person@example.test"] }, budget()),
    ).toEqual({ status: "unresolved", reason: "email_unavailable" });
  });
  it("reports inactive accounts and excludes app accounts", async () => {
    request
      .mockResolvedValueOnce([
        user("inactive", false),
        { ...user("app"), accountType: "app" },
      ])
      .mockResolvedValueOnce({
        accountId: "inactive",
        email: "person@example.test",
      });
    expect(
      await lookupUserByEmail({ Email: ["person@example.test"] }, budget()),
    ).toEqual({ status: "unresolved", reason: "inactive_account" });
    expect(request).toHaveBeenCalledTimes(2);
  });
  it("reports no matching account", async () => {
    request.mockResolvedValueOnce([]);
    expect(
      await lookupUserByEmail({ Email: ["person@example.test"] }, budget()),
    ).toEqual({ status: "unresolved", reason: "unmatched" });
  });
  it("preserves API failures and budget continuations independently of lookup outcomes", async () => {
    request.mockRejectedValueOnce(new ContinueLater(30));
    await expect(
      lookupUserByEmail({ Email: ["person@example.test"] }, budget()),
    ).rejects.toMatchObject({ delaySeconds: 30 });
    request.mockRejectedValueOnce(new Error("API unavailable"));
    await expect(
      lookupUserByEmail({ Email: ["person@example.test"] }, budget()),
    ).rejects.toThrow("API unavailable");
  });
});
