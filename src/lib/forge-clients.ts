import api, {
  type APIResponse,
  assumeTrustedRoute,
  type RequestInit,
  route,
} from '@forge/api';
import createClient from 'openapi-fetch';

import type { paths as assetsPaths } from './assets-api';

export type AssetsClient = ReturnType<typeof createClient<assetsPaths>>;

type OpenApiResult =
  | {
      data: unknown;
      error?: never;
      response: Response;
    }
  | {
      data?: never;
      error: unknown;
      response: Response;
    };

type OpenApiResultDataOf<TResult> = Extract<TResult, { data: unknown }>['data'];

type OpenApiResultErrorOf<TResult> = Extract<TResult, { error: unknown }>['error'];

export class OpenApiResponseError<TError = unknown> extends Error {
  readonly response: Response;
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly body: TError | undefined;

  constructor(response: Response, body: TError | undefined, message?: string) {
    super(message ?? `Request failed: ${response.status} ${response.statusText}`);
    this.name = 'OpenApiResponseError';
    this.response = response;
    this.status = response.status;
    this.statusText = response.statusText;
    this.url = response.url;
    this.body = body;
  }
}

// inspired by this comment:
//   https://community.developer.atlassian.com/t/type-safety-for-requestproduct-api-interactions/90325/3
const asAppJiraFetch = async (input: Request): Promise<Response> => {
  const url = new URL(input.url);
  const path = `${url.pathname}${url.search}`;

  const opts: RequestInit = {
    headers: {
      ...Object.fromEntries(input.headers),
    },
    method: input.method,
  };

  if (input.body) {
    opts.body = await input.text();
  }

  //CODE_REVIEW_CATCH_ME: this should be replaced by something MUCH less verbose
  console.debug(`as app fetch route <${path}> with options <${JSON.stringify(opts)}>`);
  const apiResponse: Promise<APIResponse> = api
    .asApp()
    .requestJira(assumeTrustedRoute(path), opts);

  return apiResponse as Promise<Response>;
};

export const assetsClient = (workspaceId: string): AssetsClient => {
  const path = route`/jsm/assets/workspace/${workspaceId}/v1`.value;
  const client = createClient<assetsPaths>({
    // only the path matters here because its all we use in the asAppJiraFetch
    // however, the openapi-fetch library requires valid url to call the fetch
    // method to start with, so we just use nonsense host.
    baseUrl: `https://ignoreme.com${path}`,
    fetch: asAppJiraFetch,
  });
  return client;
};

export const unwrap = async <TResult extends OpenApiResult>(
  promise: Promise<TResult>,
  message = 'OpenAPI error',
): Promise<OpenApiResultDataOf<TResult>> => {
  const result = await promise;

  if ('error' in result) {
    throw new OpenApiResponseError(
      result.response,
      result.error as OpenApiResultErrorOf<TResult>,
      message,
    );
  }

  return result.data as OpenApiResultDataOf<TResult>;
};
