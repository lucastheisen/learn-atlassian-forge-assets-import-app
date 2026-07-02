#!/bin/bash

### Examples:
###   # optionally set up env to include required FORGE_ vars
###   . ~/.local/bin/forge_webtrigger_env.sh
###
###   # call env setup explicitly when not set in current shell, then create a
###   # new upload
###   ~/.local/bin/forge_webtrigger_env.sh ./webtrigger.sh <<'EOF'
###   {
###     "type": "upload-new",
###     "uploadId": "smoke-users"
###   }
###   EOF
###
###   # Add a chunk
###   ./webtrigger.sh <<'EOF'
###   {
###     "type": "upload-data",
###     "uploadId": "smoke-users",
###     "index": 0,
###     "data": {
###       "users": [
###         {
###           "name": "Smoke User 001",
###           "active": true,
###           "first_name": "Smoke",
###           "last_name": "User001",
###           "email": "smoke-user-001@example.invalid",
###           "phone": "555-0101",
###           "title": "Engineer"
###         }
###       ]
###     }
###   }
###   EOF
###
###   # Complete the upload
###   ./webtrigger.sh <<'EOF'
###   {
###     "type": "upload-complete",
###     "uploadId": "smoke-users"
###   }
###   EOF
###
###   # Prune ALL completed
###   ./webtrigger.sh <<'EOF'
###   {
###     "type": "prune",
###     "keepN": 0
###   }
###
###   # Abort the upload
###   ./webtrigger.sh <<'EOF'
###   {
###     "type": "upload-abort",
###     "uploadId": "smoke-users"
###   }
###   EOF
###
###   # Run a smoke test on the upload
###   ./webtrigger.sh <<'EOF'
###   {
###     "type": "upload-smoke-assert-latest",
###     "expectedKeys": 1,
###     "expectedRecords": 1,
###     "expectedTopLevelKey": "users"
###   }
###   EOF

set -eo pipefail

readonly PROJECT_ROOT_DIR="$(dirname "$(readlink --canonicalize-existing "$0")")"

function write_curl_config {
  local config=$1

  local token
  token="$(cd "${PROJECT_ROOT_DIR}" && npm run --silent generate:secret-key)"

  printf 'header = "Authorization: Bearer %s"\n' "${token}" > "${config}"
}

function main {
  if [[ ! -v FORGE_WEBTRIGGER_SECRET ]]; then
    # must match the secret supplied to `forge variables set --encrypt`
    error_exit "FORGE_WEBTRIGGER_SECRET required"
  fi
  if [[ ! -v FORGE_WEBTRIGGER_URL ]]; then
    # must match the webtrigger for you module, check `forge webtriggers list`
    error_exit "FORGE_WEBTRIGGER_URL required"
  fi

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
    "${FORGE_WEBTRIGGER_URL}"
  )
  "${cmd[@]}"
}

main
