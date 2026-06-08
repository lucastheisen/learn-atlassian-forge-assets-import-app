import { beforeEach, describe, expect, it, vi } from "vitest";
import kvs from "@forge/kvs";
import { prune } from "../lib/kv-data";
import { isJOSEError, jwtVerify } from "../lib/jose";
import { webtriggerDispatch } from "./webtriggers-resolver";

vi.mock("../lib/jose", () => ({
  jwtVerify: vi.fn(),
  isJOSEError: vi.fn(),
}));

vi.mock("../lib/kv-data", () => ({
  prune: vi.fn(),
}));

vi.mock("@forge/kvs", () => ({
  default: {
    batchDelete: vi.fn(),
  },
}));

describe("webtriggerDispatch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FORGE_WEBTRIGGER_SECRET = "test-secret";
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "debug").mockImplementation(() => {});
    vi.mocked(isJOSEError).mockResolvedValue(false);
  });

  it("executes prune end-to-end and returns success", async () => {
    vi.mocked(jwtVerify).mockResolvedValueOnce({ sub: "user-1" } as any);
    vi.mocked(prune).mockResolvedValueOnce(undefined);

    const response = await webtriggerDispatch(
      {
        headers: { authorization: ["Bearer signed-token"] },
        body: JSON.stringify({ type: "prune", keepN: 2 }),
      } as any,
      {} as any,
    );

    expect(response).toEqual({ outputKey: "status-ok" });
    expect(prune).toHaveBeenCalledWith(2);
  });

  it("returns bad-request for malformed JSON", async () => {
    vi.mocked(jwtVerify).mockResolvedValueOnce({ sub: "user-1" } as any);

    const response = await webtriggerDispatch(
      {
        headers: { authorization: ["Bearer signed-token"] },
        body: "{",
      } as any,
      {} as any,
    );

    expect(response).toEqual({ outputKey: "status-error-bad-request" });
  });

  it("returns bad-request-validate for schema-invalid input", async () => {
    vi.mocked(jwtVerify).mockResolvedValueOnce({ sub: "user-1" } as any);

    const response = await webtriggerDispatch(
      {
        headers: { authorization: ["Bearer signed-token"] },
        body: JSON.stringify({ type: "prune", keepN: -1 }),
      } as any,
      {} as any,
    );

    expect(response).toEqual({ outputKey: "status-error-bad-request-validate" });
  });

  it("returns unauthorized when jwt verification fails", async () => {
    vi.mocked(jwtVerify).mockRejectedValueOnce(new Error("bad jwt"));
    vi.mocked(isJOSEError).mockResolvedValueOnce(true);

    const response = await webtriggerDispatch(
      {
        headers: { authorization: ["Bearer bad-token"] },
        body: JSON.stringify({ type: "prune", keepN: 2 }),
      } as any,
      {} as any,
    );

    expect(response).toEqual({ outputKey: "status-error-unauthorized" });
    expect(prune).not.toHaveBeenCalled();
  });

  it("returns internal-server-error when kvs batch delete reports failed keys", async () => {
    vi.mocked(jwtVerify).mockResolvedValueOnce({ sub: "user-1" } as any);
    vi.mocked(kvs.batchDelete).mockResolvedValueOnce({
      failedKeys: ["a"],
    } as any);

    const response = await webtriggerDispatch(
      {
        headers: { authorization: ["Bearer signed-token"] },
        body: JSON.stringify({ type: "kvs-delete", keys: ["a"] }),
      } as any,
      {} as any,
    );

    expect(response).toEqual({ outputKey: "status-error-internal-server-error" });
    expect(kvs.batchDelete).toHaveBeenCalledWith([{ key: "a" }]);
  });

  it("returns unauthorized when the Authorization header is missing", async () => {
    const response = await webtriggerDispatch(
      {
        headers: {},
        body: JSON.stringify({ type: "prune", keepN: 2 }),
      } as any,
      {} as any,
    );

    expect(response).toEqual({ outputKey: "status-error-unauthorized" });
    expect(jwtVerify).not.toHaveBeenCalled();
    expect(prune).not.toHaveBeenCalled();
  });
});
