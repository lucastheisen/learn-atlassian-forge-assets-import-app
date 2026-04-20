#!/bin/bash

readonly SITE_NAME="${SITE_NAME:-lucastheisen}"

set -e

function run_curl {
  local cmd=(curl --header "Authorization: Bearer $(cat ./token.txt)" "$@")
  "${cmd[@]}"
}

function get_workspace {
  # https://developer.atlassian.com/cloud/assets/assets-rest-api-guide/workflow/
  run_curl "https://${SITE_NAME}.atlassian.net/rest/servicedeskapi/assets/workspace" -vvv
}

function curl_assets {
  local url=https://api.atlassian.com/ex/jira/{cloudId}/jsm/assets/workspace/{workspaceId}/v{version}/object/{id}
  local cmd=(
    curl
    --silent
  )
}

function main {
  get_workspace 
}

main "$@"
