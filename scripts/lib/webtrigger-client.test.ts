import { afterEach, describe, expect, it, vi } from "vitest";
import {
  callWebTrigger,
  WebTriggerTransportError,
} from "./webtrigger-client.js";

vi.mock("./webtrigger-token.js", () => ({
  generateWebTriggerToken: vi.fn().mockResolvedValue("token"),
}));

const connection = { secret: "secret", url: "https://example.invalid" };

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("callWebTrigger", () => {
  it("keeps transport failures distinct from validation failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Authorization: secret")),
    );
    await expect(callWebTrigger({}, connection)).rejects.toEqual(
      new WebTriggerTransportError(),
    );
  });

it.each([
    null,
    { status: 202, title: "pending" },
    { phase: "private@example.test", status: 202, title: "pending" },
  ])("rejects malformed metadata without exposing its values", async (body) => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify(body), { status: 202 })),
    );
    await expect(callWebTrigger({}, connection)).rejects.toEqual(
      new Error("Webtrigger returned invalid response metadata (HTTP 202)"),
    );
  });

it("still rejects a mismatch between HTTP status and validated metadata", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ phase: "queued", status: 202, title: "pending" }),
          ),
        ),
    );
    await expect(callWebTrigger({}, connection)).rejects.toThrow(
      "status mismatch",
    );
  });

it("validates progress responses and strips unknown fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            phase: "ingesting",
            private: "secret",
            status: 202,
            title: "pending",
          }),
          { status: 202 },
        ),
      ),
    );
    await expect(callWebTrigger({}, connection)).resolves.toEqual({
      phase: "ingesting",
      status: 202,
      title: "pending",
    });
  });
});
