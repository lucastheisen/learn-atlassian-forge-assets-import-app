import api, {
  type APIResponse,
  type RequestInit,
  type Route,
} from "@forge/api";
import type { MetricOperation } from "./reference-metric-schemas";
import {
  countReferenceMetric,
  measureReferenceOperation,
} from "./reference-metrics";
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
    let body = "";
    try {
      const result = await measureReferenceOperation(
        requestMetric(path, options.method),
        async () => {
          const response = await api.asApp().requestJira(path, {
            ...options,
            headers: { Accept: "application/json", ...options.headers },
            signal: AbortSignal.timeout(20_000),
          });
          const body =
            response.ok && response.status !== 204 ? await response.text() : "";
          return { body, response };
        },
      );
      response = result.response;
      body = result.body;
    } catch {
      countReferenceMetric("networkErrors");
      if (
        attempt === 2 ||
        (options.method === "POST" && path.value.endsWith("/executions"))
      )
        throw new ProductRequestError(0);
      continue;
    }
    if (response.ok) {
      if (response.status === 204) return undefined as T;
      return (body.length ? JSON.parse(body) : undefined) as T;
    }
    if (response.status === 429 || response.status >= 500) {
      countReferenceMetric(response.status === 429 ? "http429" : "http5xx");
      const retryAfter = response.headers.get("Retry-After");
      const seconds =
        retryAfter === null
          ? 2 ** attempt
          : /^\d+$/.test(retryAfter)
            ? Number(retryAfter)
            : Math.ceil((Date.parse(retryAfter) - budget.now()) / 1000);
      // A continuation awaits this request's completion. It never assumes an aborted write rolled back.
      throw new ContinueLater(
        Number.isFinite(seconds) ? Math.max(1, seconds) : 30,
      );
    }
    if (response.status >= 400 && response.status < 500)
      countReferenceMetric("http4xx");
    throw new ProductRequestError(response.status);
  }
  throw new ProductRequestError(0);
}

function requestMetric(path: Route, method?: string): MetricOperation {
  const pathname = path.value.split("?")[0] ?? "";
  if (pathname.endsWith("/user/search")) return "jira.search";
  if (pathname.endsWith("/user/email")) return "jira.email";
  if (pathname.includes("/executions")) return "assets.execution";
  if (pathname.endsWith("/object/aql")) return "assets.search";
  if (/\/object\/[^/]+$/.test(pathname))
    return method === "PUT" ? "assets.object.write" : "assets.object.read";
  return "assets.schema";
}
