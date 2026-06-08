import { beforeEach, describe, expect, it, vi } from "vitest";
import { isJOSEError, jwtVerify } from "../../lib/jose";
import { verifyBearerToken } from "./auth";
import { InternalServerError, UnauthorizedError } from "./errors";

vi.mock("../../lib/jose", () => ({
  jwtVerify: vi.fn(),
  isJOSEError: vi.fn(),
}));

describe("verifyBearerToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.FORGE_WEBTRIGGER_SECRET;
  });

  it("throws InternalServerError when the secret env var is not configured", async () => {
    await expect(verifyBearerToken(undefined)).rejects.toBeInstanceOf(InternalServerError);
  });

  it("throws UnauthorizedError when the Authorization header is missing", async () => {
    process.env.FORGE_WEBTRIGGER_SECRET = "test-secret";

    await expect(verifyBearerToken(undefined)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("throws UnauthorizedError when the Authorization header is malformed", async () => {
    process.env.FORGE_WEBTRIGGER_SECRET = "test-secret";

    await expect(
      verifyBearerToken({ authorization: ["Basic abc"] } as any),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("accepts a case-insensitive bearer scheme, trims trailing whitespace, and returns claims", async () => {
    process.env.FORGE_WEBTRIGGER_SECRET = "test-secret";
    vi.mocked(jwtVerify).mockResolvedValueOnce({ sub: "user-123" } as any);

    await expect(
      verifyBearerToken({ authorization: ["bearer token-abc   "] } as any),
    ).resolves.toEqual({ sub: "user-123" });

    expect(jwtVerify).toHaveBeenCalledWith(
      "token-abc",
      expect.anything(),
      {
        algorithms: ["HS256"],
        audience: "write:workitem:custom",
        clockTolerance: 30,
        requiredClaims: ["exp", "iss", "iat"],
      },
    );
  });

  it("maps JOSE verification failures to UnauthorizedError", async () => {
    process.env.FORGE_WEBTRIGGER_SECRET = "test-secret";
    const joseErr = new Error("bad jwt");

    vi.mocked(jwtVerify).mockRejectedValueOnce(joseErr);
    vi.mocked(isJOSEError).mockResolvedValueOnce(true);

    await expect(
      verifyBearerToken({ authorization: ["Bearer token-abc"] } as any),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("rethrows non-JOSE verification failures", async () => {
    process.env.FORGE_WEBTRIGGER_SECRET = "test-secret";
    const err = new Error("boom");

    vi.mocked(jwtVerify).mockRejectedValueOnce(err);
    vi.mocked(isJOSEError).mockResolvedValueOnce(false);

    await expect(
      verifyBearerToken({ authorization: ["Bearer token-abc"] } as any),
    ).rejects.toBe(err);
  });
});
