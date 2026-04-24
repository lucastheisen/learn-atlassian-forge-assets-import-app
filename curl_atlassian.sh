#!/bin/bash

### Examples:
###   # find the first User with email of me@lucastheisen.com
###   ./curl_atlassian.sh \
###     assets/object/aql?maxResults=1 \
###     --silent \
###     --request POST \
###     --data "{\"qlQuery\": \"objectType = \\\"User\\\" and \\\"Email Address\\\" = \\\"me@lucastheisen.com\\\"\"}" \
###     | clconf --pipe

set -e

readonly RBW_NAME="${RBW_NAME:-atlassian.com}"
readonly RBW_TOKEN_FIELD="${RBW_TOKEN_FIELD:-curl_api_token}"
readonly RBW_ASSETS_IMPORTSOURCE_TOKEN_FIELD="${RBW_ASSETS_IMPORTSOURCE_TOKEN_FIELD:-assets_token}"

readonly API_TOKEN="${API_TOKEN:-"$(
  rbw get "${RBW_NAME}" --raw \
    | clconf \
      --pipe \
      jsonpath "$.fields[?(@.name == '${RBW_TOKEN_FIELD}')].value" \
      --first)"}"
readonly API_USER="${API_USER:-"$(
  rbw get "${RBW_NAME}" --raw \
    | clconf --pipe getv /data/username)"}"
readonly ASSETS_IMPORTSOURCE_TOKEN="${ASSETS_IMPORTSOURCE_TOKEN:-"$(
  rbw get "${RBW_NAME}" --raw \
    | clconf \
      --pipe \
      jsonpath "$.fields[?(@.name == '${RBW_ASSETS_IMPORTSOURCE_TOKEN_FIELD}')].value" \
      --first)"}"
readonly ATLASSIAN_SITE="${ATLASSIAN_SITE:-lucastheisen}"

function auth_basic {
  printf 'Authorization: Basic %s' "$(printf '%s:%s' "${API_USER}" "${API_TOKEN}" | base64 -w0)"
}

function auth_assets_importsource {
  printf "Authorization: Bearer %s" "${ASSETS_IMPORTSOURCE_TOKEN}"
}

function assets_url {
  local path_and_query=$1
  printf 'https://api.atlassian.com/ex/jira/%s/jsm/assets/workspace/%s/v1/%s' \
    "$(cloud_id)" \
    "$(workspace_id)" \
    "${path_and_query}"
}

function cloud_id {
  curl_api "https://${ATLASSIAN_SITE}.atlassian.net/_edge/tenant_info" \
    | clconf --pipe getv /cloudId
}

function curl_api {
  run_curl "$(auth_basic)" "$@"
}

function curl_assets {
  local path_and_query="$1"
  local curl_args=("${@:2}")

  local url="$(assets_url "${path_and_query}")"
  case "${path_and_query%%/*}" in
    importsource) run_curl "$(auth_assets_importsource)" "${url}" "${curl_args[@]}";;
    *) run_curl "$(auth_basic)" "${url}" "${curl_args[@]}";;
  esac
}

function curl_assets_importsource {
  run_curl "$(printf "Authorization: Bearer %s" "${ASSETS_TOKEN}")" "$@"
}

function error_exit {
  printf "$1"
  exit "${2:-1}"
}

function run_curl {
  local authorization=$1
  local curl_args=("${@:2}")

  (
    local auth_file
    auth_file="$(mktemp)"
    # shellcheck disable=SC2064 # we want early interpolation here
    trap "rm --force '${auth_file}'" EXIT
    echo -n "${authorization}" > "${auth_file}"

    local cmd=(
      curl
      --header "Accept: application/json"
      --header "Content-Type: application/json"
      --header "@${auth_file}"
      --silent
      "${curl_args[@]}"
    )
    "${cmd[@]}"
  )
}

function workspace_id {
  # https://developer.atlassian.com/cloud/assets/assets-rest-api-guide/workflow/
  curl_api "https://${ATLASSIAN_SITE}.atlassian.net/rest/servicedeskapi/assets/workspace" \
    | clconf --pipe getv /values/0/workspaceId
}

function main {
  local target="${1%%/*}"
  local path_and_query="${1#*/}"
  case "${target}" in
    assets) curl_assets "${path_and_query}" "${@:2}";;
    *) error_exit "unknown api [${target}]"
  esac
}

main "$@"
