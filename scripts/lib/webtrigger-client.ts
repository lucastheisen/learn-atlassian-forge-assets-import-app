import {
  type WebTriggerResponse,
  WebTriggerResponseSchema,
} from "./import-smoke-schemas.js";
import { generateWebTriggerToken } from "./webtrigger-token.js";

export type { WebTriggerResponse } from "./import-smoke-schemas.js";

export interface WebTriggerConnection {
  secret: string;
  url: string;
}

export class WebTriggerTransportError extends Error {
  constructor() {
    super("Webtrigger request failed or timed out");
  }
}

export async function callWebTrigger(
  action: Record<string, unknown>,
  { secret, url }: WebTriggerConnection,
  signal: AbortSignal = AbortSignal.timeout(30000),
): Promise<WebTriggerResponse> {
  const token = await generateWebTriggerToken(secret);

  let response: Response;
  try {
    response = await fetch(url, {
      body: JSON.stringify(action),
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      signal,
    });
  } catch {
    throw new WebTriggerTransportError();
  }

  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch {
    throw new Error(
      `Webtrigger returned invalid JSON (HTTP ${response.status})`,
    );
  }

  const result = WebTriggerResponseSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `Webtrigger returned invalid response metadata (HTTP ${response.status})`,
    );
  }

  const body = result.data;

  if (response.status !== body.status) {
    throw new Error(
      `webtrigger response status mismatch (HTTP ${response.status})`,
    );
  }

  return body;
}
