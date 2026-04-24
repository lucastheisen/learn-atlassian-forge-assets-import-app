import api, {
  type APIResponse,
  assumeTrustedRoute,
  type RequestInit,
  route,
} from '@forge/api';
import createClient from "openapi-fetch";

import type { paths as assetsPaths } from './assets-api';

// inspired by this comment:
//   https://community.developer.atlassian.com/t/type-safety-for-requestproduct-api-interactions/90325/3

function asAppJiraFetch (input: Request, options?: RequestInit): Promise<Response> {
  const url = new URL(input.url);
  const apiResponse: Promise<APIResponse> = api
    .asApp()
    .requestJira(
      assumeTrustedRoute(url.pathname),
      {
        ...options,
        method: input.method,
        headers: {
          ...options?.headers,
          ...Object.fromEntries(input.headers)
        },
      });

  return apiResponse as Promise<Response>
};

export const assetsClient = (workspaceId: string) => {
  return createClient<assetsPaths>({
    baseUrl: (route`/jsm/assets/workspace/${workspaceId}/v1`).value,
    fetch:  asAppJiraFetch
  });
}
