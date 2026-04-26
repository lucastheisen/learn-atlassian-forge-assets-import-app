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
readonly API_VERSION=v3
readonly VERSION=1.135.74
readonly JSON_SCHEMA="https://dac-static.atlassian.com/cloud/assets/swagger.${API_VERSION}.json?_v=${VERSION}"

readonly ROOT_DIR="$(dirname "$(readlink --canonicalize-existing "$0")")"

readonly file="${ROOT_DIR}/assets-api.swagger.${API_VERSION}.${VERSION}-patched.json"
curl --location --silent "${JSON_SCHEMA}" \
  | jq '.paths."/objectschema/{id}/objecttypes".get.responses."200".content."application/json".schema = {
      "type": "array",
      "items": { "$ref": "#/components/schemas/ObjectType" }
    }' \
  > "${file}"
openapi-typescript "${file}" --output "${ROOT_DIR}/assets-api.d.ts"
