#!/bin/bash

set -e

readonly PROJECT_ROOT_DIR="$(dirname "$(readlink --canonicalize-existing "$0")")"
# used by npm generate:secret-key
readonly FORGE_WEBTRIGGER_SECRET="${FORGE_WEBTRIGGER_SECRET:-this-is-a-super-secret}";

function write_curl_config {
  local config=$1

  local token
  token="$(cd "${PROJECT_ROOT_DIR}" && npm run --silent generate:secret-key)"

  printf 'header = "Authorization: Bearer %s"\n' "${token}" > "${config}"
}

function main {
  local url="${1?webtrigger url required}"

  local config
  config="$(mktemp)"
  trap "rm --force '${config}'" EXIT
  write_curl_config "${config}"

  local cmd=(
    curl
    --config "${config}"
    --data @-
    --header "Accept: application/json"
    --header "Content-Type: application/json"
    --request POST
    "${url}"
  )
  "${cmd[@]}"
}

main "$@"
