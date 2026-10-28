import api, {
  type APIResponse,
  type RequestInit,
  type Route,
} from "@forge/api";
import {
  ContinueLater,
  type ProcessingBudget,
  ProductRequestError,
} from "./reference-types";

export async function referenceRequest<T>(
  path: Route,
  budget: ProcessingBudget,
  options: RequestInit = {},
): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    budget.check();
    let response: APIResponse;
    try {
      response = await api.asApp().requestJira(path, {
        ...options,
        headers: { Accept: "application/json", ...options.headers },
        signal: AbortSignal.timeout(20_000),
      });
    } catch {
      if (
        attempt === 2 ||
        (options.method === "POST" && path.value.endsWith("/executions"))
      )
        throw new ProductRequestError(0);
      continue;
    }
    if (response.ok) {
      if (response.status === 204) return undefined as T;
      const body = await response.text();
      return (body.length ? JSON.parse(body) : undefined) as T;
    }
    if (response.status === 429 || response.status >= 500) {
      const retryAfter = response.headers.get("Retry-After");
      const seconds =
        retryAfter === null
          ? 2 ** attempt
          : /^\d+$/.test(retryAfter)
            ? Number(retryAfter)
            : Math.ceil((Date.parse(retryAfter) - budget.now()) / 1000);
      // A continuation awaits this request's completion; it never assumes an aborted write rolled back.
      throw new ContinueLater(
        Number.isFinite(seconds) ? Math.max(1, seconds) : 30,
      );
    }
    throw new ProductRequestError(response.status);
  }
  throw new ProductRequestError(0);
}
