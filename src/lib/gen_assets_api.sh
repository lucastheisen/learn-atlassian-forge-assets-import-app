#!/bin/bash

### Generates assets-api.d.ts from the official json schema.
###
### Usage:
###   src/lib/gen_assets_api.sh
###
### Remarks:
###   Assumes openapi-typescript is previously installed:
###     npm install openapi-typescript --global


set -e

# if you navigate to the API documentation page:
#   https://developer.atlassian.com/cloud/assets/rest/api-group-importsource
# this is the download link for OpenAPI
readonly JSON_SCHEMA="https://dac-static.atlassian.com/cloud/assets/swagger.v3.json?_v=1.135.74"

readonly ROOT_DIR="$(dirname "$(readlink --canonicalize-existing "$0")")"

openapi-typescript "${JSON_SCHEMA}" --output "${ROOT_DIR}/assets-api.d.ts"
