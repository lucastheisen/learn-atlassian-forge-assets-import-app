import { route } from "@forge/api";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { referenceRequest } from "./reference-api";
import {
  ContinueLater,
  ProcessingBudget,
  ProductRequestError,
} from "./reference-types";

const { request } = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock("@forge/api", async (original) => ({
  ...(await original<typeof import("@forge/api")>()),
  default: { asApp: () => ({ requestJira: request }) },
}));
beforeEach(() => {
  request.mockReset();
});
afterEach(() => vi.useRealTimers());
describe("referenceRequest", () => {
  it("uses supported cancellation and safely returns JSON", async () => {
    request.mockResolvedValue(new Response(JSON.stringify({ value: 1 })));
    expect(
      await referenceRequest(route`/test`, new ProcessingBudget()),
    ).toEqual({ value: 1 });
    expect(request.mock.calls[0]?.[1].signal).toBeInstanceOf(AbortSignal);
  });
  it("exits before making a request when the remaining budget is too small", async () => {
    await expect(
      referenceRequest(route`/test`, new ProcessingBudget(Date.now, 1000)),
    ).rejects.toBeInstanceOf(ContinueLater);
    expect(request).not.toHaveBeenCalled();
  });
  it("schedules backoff rather than sleeping past the invocation budget", async () => {
    request.mockResolvedValue(
      new Response("", { headers: { "Retry-After": "300" }, status: 429 }),
    );
    await expect(
      referenceRequest(route`/test`, new ProcessingBudget()),
    ).rejects.toMatchObject({ delaySeconds: 300 });
    expect(request).toHaveBeenCalledOnce();
  });
  it("does not expose response bodies in errors", async () => {
    request.mockResolvedValue(
      new Response('{"email":"private@example.test"}', { status: 403 }),
    );
    await expect(
      referenceRequest(route`/test`, new ProcessingBudget()),
    ).rejects.toEqual(new ProductRequestError(403));
  });
  it("bounds network retries but never automatically retries uncertain execution creation", async () => {
    request.mockRejectedValue(new Error("network failed"));
    await expect(
      referenceRequest(route`/test`, new ProcessingBudget()),
    ).rejects.toMatchObject({ status: 0 });
    expect(request).toHaveBeenCalledTimes(3);
    request.mockClear();
    await expect(
      referenceRequest(
        route`/importsource/source/executions`,
        new ProcessingBudget(),
        { method: "POST" },
      ),
    ).rejects.toMatchObject({ status: 0 });
    expect(request).toHaveBeenCalledOnce();
  });
});

describe("stalled product requests", () => {
  it("awaits aborted requests and bounds retries without leaving background work", async () => {
    vi.useFakeTimers();
    const timeout = vi
      .spyOn(AbortSignal, "timeout")
      .mockImplementation((milliseconds) => {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), milliseconds);
        return controller.signal;
      });
    let inFlight = 0;
    request.mockImplementation(
      (_path, options) =>
        new Promise((_resolve, reject) => {
          inFlight++;
          options.signal.addEventListener("abort", () => {
            inFlight--;
            reject(new Error("aborted"));
          });
        }),
    );
    const result = expect(
      referenceRequest(route`/test`, new ProcessingBudget()),
    ).rejects.toMatchObject({ status: 0 });
    await vi.advanceTimersByTimeAsync(60_000);
    await result;
    expect(inFlight).toBe(0);
    expect(request).toHaveBeenCalledTimes(3);
    timeout.mockRestore();
  });
});
