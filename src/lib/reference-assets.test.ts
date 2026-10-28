import { beforeEach, describe, expect, it, vi } from "vitest";
import { fixtureScope, makeRun } from "../../tests/helpers/reference-storage";
import { referenceRequest } from "./reference-api";
import {
  candidateAql,
  nativeSucceeded,
  resolveReferenceSchema,
  updateReference,
} from "./reference-assets";
import { ProcessingBudget, SchemaError } from "./reference-types";

vi.mock("./reference-api", () => ({ referenceRequest: vi.fn() }));
const request = vi.mocked(referenceRequest);
beforeEach(() => {
  request.mockReset();
});
describe("candidateAql", () => {
  it("scopes both branches to the object type and floors the inclusive boundary in UTC", () => {
    expect(candidateAql("123", "2026-10-28T08:12:59.999-04:00")).toBe(
      'objectTypeId = 123 AND (Updated >= "2026-10-28T12:12:00.000Z" OR "Atlassian User" IS EMPTY) ORDER BY Key ASC',
    );
    expect(() => candidateAql("123 OR true", "2026-10-28")).toThrow(
      SchemaError,
    );
  });
});
describe("nativeSucceeded", () => {
  it("requires a documented successful progress result instead of DONE alone", () => {
    expect(nativeSucceeded({ status: "DONE" })).toBe(false);
    expect(nativeSucceeded({ status: "CANCELLED" })).toBe(false);
    expect(
      nativeSucceeded({
        status: "DONE",
        progressResult: { result: "ERROR", status: "FINISHED" },
      }),
    ).toBe(false);
    expect(
      nativeSucceeded({
        status: "DONE",
        progressResult: {
          result: "OK",
          status: "FINISHED",
          errorMessages: null,
        },
      }),
    ).toBe(true);
    expect(
      nativeSucceeded({
        status: "DONE",
        progressResult: {
          result: "OK",
          status: "FINISHED",
          objectTypeResultMap: { "10": { errorMessages: ["invalid object"] } },
        },
      }),
    ).toBe(false);
  });
});
describe("resolveReferenceSchema", () => {
  const attributes = [
    { id: "2", name: "Active", type: 0, defaultType: { id: 2 } },
    { id: "3", name: "Email", type: 0 },
    { id: "4", name: "Atlassian User", maximumCardinality: 1, type: 2 },
  ];
  it("resolves environment-specific IDs from the mapped users selector and type metadata", async () => {
    request
      .mockResolvedValueOnce({
        importSourceOTEntries: [
          { selector: "users", objectType: { id: "10" } },
        ],
      })
      .mockResolvedValueOnce(attributes);
    expect(
      await resolveReferenceSchema(fixtureScope, new ProcessingBudget()),
    ).toMatchObject({
      activeAttributeId: "2",
      emailAttributeId: "3",
      objectTypeId: "10",
      userAttributeId: "4",
    });
  });
  it("rejects multi-value User attributes before reference writes", async () => {
    request
      .mockResolvedValueOnce({
        importSourceOTEntries: [
          { selector: "users", objectType: { id: "10" } },
        ],
      })
      .mockResolvedValueOnce(
        attributes.map((value) =>
          value.type === 2 ? { ...value, maximumCardinality: -1 } : value,
        ),
      );
    await expect(
      resolveReferenceSchema(fixtureScope, new ProcessingBudget()),
    ).rejects.toThrow(SchemaError);
  });
  it("does not select an arbitrary type when multiple mappings share the users selector", async () => {
    request.mockResolvedValueOnce({
      importSourceOTEntries: [
        { selector: "users", objectType: { id: "10" } },
        { selector: "users", objectType: { id: "11" } },
      ],
    });
    await expect(
      resolveReferenceSchema(fixtureScope, new ProcessingBudget()),
    ).rejects.toThrow(SchemaError);
  });
});
describe("updateReference", () => {
  it("writes exactly one account ID and only the target attribute", async () => {
    request.mockResolvedValueOnce(undefined);
    await updateReference(
      makeRun(),
      "asset-1",
      "account-1",
      new ProcessingBudget(),
    );
    expect(request.mock.calls[0]?.[0].value).toContain("/object/asset-1");
    expect(JSON.parse(String(request.mock.calls[0]?.[2]?.body))).toEqual({
      objectTypeId: "10",
      attributes: [
        {
          objectTypeAttributeId: "4",
          objectAttributeValues: [{ value: "account-1" }],
        },
      ],
    });
  });
});
