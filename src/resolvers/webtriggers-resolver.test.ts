import type { WebTriggerContext, WebTriggerRequest } from "@forge/api";
import { afterEach, describe, expect, it, vi } from "vitest";
import { execute } from "./webtrigger";
import { webtriggerDispatch } from "./webtriggers-resolver";

vi.mock("./webtrigger", () => ({ execute: vi.fn(), parse: vi.fn() }));
vi.mock("./webtrigger/auth", () => ({
  verifyBearerToken: vi.fn().mockResolvedValue({}),
}));
afterEach(() => vi.restoreAllMocks());
describe("webtriggerDispatch", () => {
  it("logs only error metadata when an exception includes private payloads", async () => {
    const log = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.mocked(execute).mockRejectedValueOnce(
      new Error(
        "API body included private@example.test and Authorization: secret",
      ),
    );
    const result = await webtriggerDispatch(
      { headers: {}, body: "{}" } as WebTriggerRequest,
      {} as WebTriggerContext,
    );
    expect(result.outputKey).toBe("status-error-internal-server-error");
    expect(JSON.stringify(log.mock.calls)).not.toContain(
      "private@example.test",
    );
    expect(JSON.stringify(log.mock.calls)).not.toContain("secret");
  });
});
