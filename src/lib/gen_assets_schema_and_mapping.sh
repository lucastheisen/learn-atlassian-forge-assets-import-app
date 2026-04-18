#!/bin/bash

### Generates assets-schema-and-mappings.d.ts from the official json schema.
###
### Usage:
###   src/lib/gen_assets_schema_and_mapping.sh
###
### Remarks:
###   Assumes json2ts is previously installed:
###     npm install json-schema-to-typescript --global


set -e

readonly JSON_SCHEMA="https://api.atlassian.com/jsm/assets/imports/external/schema/versions/2023_10_19"

readonly ROOT_DIR="$(dirname "$(readlink --canonicalize-existing "$0")")"

curl --silent "${JSON_SCHEMA}" | json2ts --output "${ROOT_DIR}/assets-schema-and-mapping.d.ts"
