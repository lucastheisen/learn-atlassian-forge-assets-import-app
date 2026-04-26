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

async function asAppJiraFetch (input: Request): Promise<Response> {
  const path = new URL(input.url).pathname;
  const opts: RequestInit = {
    headers: {
      ...Object.fromEntries(input.headers)
    },
    method: input.method,
  };
  if (input.body) {
    opts.body = await input.text();
  }

  console.log(`as app fetch route <${path}> with options <${JSON.stringify(opts)}>`);
  const apiResponse: Promise<APIResponse> = api
    .asApp()
    .requestJira(assumeTrustedRoute(path), opts);

  return apiResponse as Promise<Response>;
};

export const assetsClient = (workspaceId: string) => {
  const path = route`/jsm/assets/workspace/${workspaceId}/v1`.value;
  const client = createClient<assetsPaths>({
    // only the path matters here because its all we use in the asAppJiraFetch
    // however, the openapi-fetch library requires valid url to call the fetch
    // method to start with, so we just use nonsense host.
    baseUrl: `https://ignoreme.com${path}`,
    fetch:  asAppJiraFetch,
  });
  return client;
}
