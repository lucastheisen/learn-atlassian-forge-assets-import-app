#!/bin/bash

### Fast repro for https://github.com/lucastheisen/learn-atlassian-forge-assets-import-app/issues/2
### "User reference mapping does not work"
###
### This targets a native "External Import" source specifically (Schema
### settings -> Import tab -> Create Import -> External Import, authenticated
### with its own generated bearer token) - NOT this repo's custom Forge app
### (jiraServiceManagement:assetsImportType). The custom-app case was already
### confirmed broken the same way via a separate manual investigation, see
### docs/NOTES.md. This script exists to check whether native External Import
### diverges from that, now that Atlassian has published setup docs for
### email-based User-attribute resolution.
###
### Background:
###   https://community.developer.atlassian.com/t/how-can-i-get-a-user-reference-attribute-to-synchronize-from-an-incoming-mapping-via-email-address/100676
###   Tracked (as of this writing, still open) as
###   https://jira.atlassian.com/browse/JSDCLOUD-10732
###   Not to be confused with the (resolved, but does not cover External Import)
###   https://jira.atlassian.com/browse/JSDCLOUD-10487
###
### What this proves:
###   1. GET .../importsource/{id}/schema-and-mapping omits the User-type
###      attribute from the object type's attribute list entirely.
###   2. GET .../objecttype/{id}/attributes (general Assets API) confirms the
###      attribute genuinely exists, with type=2 (User).
###   3. PATCH .../importsource/{id}/mapping, attempting to map it anyway using
###      its real numeric attribute id as attributeExternalId, is rejected
###      server-side with dataValidationErrors[].code == UNKNOWN_EXTERNAL_ID_MAPPING
###      - i.e. this attribute has no externalId in the import-mapping system at
###      all, so there is no value that would let you map it.
###
### Setup:
###   Complete steps 1-3 of the "Smoke Test" one-time environment setup in
###   docs/DEVELOPMENT.md: the SMOKE schema, the "Smoke User" object type, and
###   its attributes, including "Atlassian User" (User).
###
###   Then, instead of step 4 (picking this repo's Forge app), create a native
###   External Import source on that same schema:
###     1. On the schema, open Schema settings -> Import tab.
###     2. Click Create Import, choose External Import, name it
###        "Smoke External Import", then Create Import.
###     3. On that new import, use its "..." menu -> Generate new token.
###     4. Save the generated token as the "smoke_external_import_token" field
###        on curl_atlassian.sh's rbw entry (see its own header comment for
###        RBW_NAME/RBW_ASSETS_IMPORTSOURCE_TOKEN_FIELD), or override the field
###        name via RBW_ASSETS_IMPORTSOURCE_TOKEN_FIELD below. Not using rbw?
###        export ASSETS_IMPORTSOURCE_TOKEN=<token> instead, same as
###        curl_atlassian.sh itself supports.
###
### Requires:
###   curl_atlassian.sh (repo root) configured for your site - see its own
###   header comment: either rbw, or API_TOKEN/API_USER/ATLASSIAN_SITE set
###   directly.
###
###   clconf (https://github.com/pastdev/clconf).
###
### Logging:
###   Set LOG_VERBOSITY=v (or vv for response payloads too) to see output.
###
### Usage:
###   LOG_VERBOSITY=v ./repro_external_import_user_attribute.sh

set -eo pipefail

readonly SCRIPT_DIR="$(dirname "$(readlink --canonicalize-existing "$0")")"
readonly PROJECT_ROOT_DIR="$(dirname "$(dirname "${SCRIPT_DIR}")")"
readonly CURL_ATLASSIAN="${PROJECT_ROOT_DIR}/curl_atlassian.sh"

readonly SCHEMA_KEY="${SCHEMA_KEY:-SMOKE}"
readonly OBJECT_TYPE_NAME="${OBJECT_TYPE_NAME:-Smoke User}"
readonly ATTRIBUTE_NAME="${ATTRIBUTE_NAME:-Atlassian User}"

# curl_atlassian.sh falls back to rbw for ASSETS_IMPORTSOURCE_TOKEN when it
# isn't set directly; point it at this repro's own token field by default.
readonly RBW_ASSETS_IMPORTSOURCE_TOKEN_FIELD="${RBW_ASSETS_IMPORTSOURCE_TOKEN_FIELD:-smoke_external_import_token}"
export RBW_ASSETS_IMPORTSOURCE_TOKEN_FIELD

function build_updated_mapping {
  local schema_and_mapping=$1
  local object_type_mapping_index=$2
  local attribute_id=$3

  local icons
  icons="$(clconf --pipe jsonpath '$.schema.iconSchema.icons' --output json --first \
    <<< "${schema_and_mapping}" 2>/dev/null)"

  local attribute_mapping="{\"attributeName\":\"${ATTRIBUTE_NAME}\",\"attributeExternalId\":\"${attribute_id}\",\"attributeLocators\":[\"email\"]}"

  local patch
  if [[ -n "${object_type_mapping_index}" ]]; then
    patch="[{\"op\":\"add\",\"path\":\"/mapping/objectTypeMappings/${object_type_mapping_index}/attributesMapping/-\",\"value\":${attribute_mapping}}"
  else
    # no objectTypeMapping exists yet on this import source - create one, same
    # as configuring a mapping for the first time is part of setting up any
    # import source.
    local object_type_external_id
    object_type_external_id="$(clconf --pipe jsonpath \
      "\$.schema.objectSchema.objectTypes[?(@.name=='${OBJECT_TYPE_NAME}')].externalId" \
      --first <<< "${schema_and_mapping}" 2>/dev/null)"
    if [[ -z "${object_type_external_id}" ]]; then
      error_exit "no externalId found for object type ${OBJECT_TYPE_NAME} in schema-and-mapping"
    fi

    local object_type_mapping="{\"description\":\"\",\"objectTypeExternalId\":\"${object_type_external_id}\",\"objectTypeName\":\"${OBJECT_TYPE_NAME}\",\"selector\":\"users\",\"attributesMapping\":[${attribute_mapping}]}"
    patch="[{\"op\":\"add\",\"path\":\"/mapping/objectTypeMappings/-\",\"value\":${object_type_mapping}}"
  fi

  if [[ "${icons}" == "[]" ]]; then
    # an empty iconSchema is returned by GET but rejected by PATCH, see
    # src/lib/schema-mapping.ts
    patch="${patch},{\"op\":\"remove\",\"path\":\"/schema/iconSchema\"}"
  fi
  patch="${patch}]"

  clconf --pipe --patch-string "${patch}" jsonpath '$' --output json --first \
    <<< "${schema_and_mapping}"
}

function discover_import_source_id {
  local info
  info="$("${CURL_ATLASSIAN}" assets/imports/info)"

  local mapping_link
  mapping_link="$(clconf --pipe jsonpath '$.links.mapping' --first <<< "${info}" 2>/dev/null)"
  if [[ -z "${mapping_link}" ]]; then
    error_exit "unable to discover import source from ASSETS_IMPORTSOURCE_TOKEN:\n${info}"
  fi

  sed -E 's#.*/importsource/([^/]+)/mapping$#\1#' <<< "${mapping_link}"
}

function error_exit {
  >&2 echo -e "$1"
  exit "${2:-1}"
}

function find_attribute_field {
  local object_type_id=$1
  local field=$2

  clconf --pipe jsonpath \
    "\$[?(@.name=='${ATTRIBUTE_NAME}')].${field}" \
    --first \
    <<< "$("${CURL_ATLASSIAN}" "assets/objecttype/${object_type_id}/attributes")" \
    2>/dev/null
}

function find_mapped_attribute_names {
  local schema_and_mapping=$1

  clconf --pipe jsonpath \
    "\$.schema.objectSchema.objectTypes[?(@.name=='${OBJECT_TYPE_NAME}')].attributes[*].name" \
    <<< "${schema_and_mapping}"
}

function find_object_type_id {
  local schema_id=$1

  clconf --pipe jsonpath \
    "\$[?(@.name=='${OBJECT_TYPE_NAME}')].id" \
    --first \
    <<< "$("${CURL_ATLASSIAN}" "assets/objectschema/${schema_id}/objecttypes")" \
    2>/dev/null
}

function find_object_type_mapping_index {
  local schema_and_mapping=$1

  local index=0
  local name
  while name="$(clconf --pipe jsonpath \
      "\$.mapping.objectTypeMappings[${index}].objectTypeName" \
      --first \
      <<< "${schema_and_mapping}" 2>/dev/null)"; do
    if [[ "${name}" == "${OBJECT_TYPE_NAME}" ]]; then
      echo "${index}"
      return
    fi
    index=$((index + 1))
  done
}

function find_schema_id {
  clconf --pipe jsonpath \
    "\$.values[?(@.objectSchemaKey=='${SCHEMA_KEY}')].id" \
    --first \
    <<< "$("${CURL_ATLASSIAN}" assets/objectschema/list)" \
    2>/dev/null
}

function log {
  # this avoids logging if `set -x` is on as it would be duplicative
  if [[ $- != *x* ]]; then
    local verbosity=$1
    local message=$2

    if [[ "${LOG_VERBOSITY:-x}" =~ ^${verbosity} ]]; then
      >&2 printf "%s [%3s] %s: %b\n" \
        "$(date +%H:%M:%S)" \
        "${verbosity}" \
        "$(caller 0 | awk '{print $2}')" \
        "${message}"
    fi
  fi
}

function main {
  local import_source_id
  import_source_id="$(discover_import_source_id)"
  log v "discovered import source: ${import_source_id}"

  log v "1. checking schema-and-mapping for \"${ATTRIBUTE_NAME}\" on \"${OBJECT_TYPE_NAME}\""
  local schema_and_mapping
  schema_and_mapping="$("${CURL_ATLASSIAN}" "assets/importsource/${import_source_id}/schema-and-mapping")"

  local mapped_attribute_names
  mapped_attribute_names="$(find_mapped_attribute_names "${schema_and_mapping}")"
  log vv "attributes present in schema-and-mapping:\n${mapped_attribute_names}"

  if grep -qxF -- "- ${ATTRIBUTE_NAME}" <<< "${mapped_attribute_names}"; then
    log v "NOT REPRODUCED: \"${ATTRIBUTE_NAME}\" IS present in schema-and-mapping.\nThis may mean the underlying bug is now fixed - worth re-checking JSDCLOUD-10732."
    exit 0
  fi
  log v "confirmed: \"${ATTRIBUTE_NAME}\" is absent from schema-and-mapping"

  log v "2. confirming the attribute exists in Assets (general API) as type=User"
  local schema_id
  schema_id="$(find_schema_id)"
  if [[ -z "${schema_id}" ]]; then
    error_exit "no schema found for key ${SCHEMA_KEY} - see Setup above"
  fi

  local object_type_id
  object_type_id="$(find_object_type_id "${schema_id}")"
  if [[ -z "${object_type_id}" ]]; then
    error_exit "no object type found named ${OBJECT_TYPE_NAME} - see Setup above"
  fi

  local attribute_id
  attribute_id="$(find_attribute_field "${object_type_id}" id)"
  if [[ -z "${attribute_id}" ]]; then
    error_exit "no attribute found named ${ATTRIBUTE_NAME} on object type ${OBJECT_TYPE_NAME} - see Setup above"
  fi

  local attribute_type
  attribute_type="$(find_attribute_field "${object_type_id}" type)"
  log v "found attribute: id=${attribute_id} type=${attribute_type} (2 == User)"
  if [[ "${attribute_type}" != "2" ]]; then
    log v "WARNING: attribute type is not 2 (User) - this repro assumes a User-type attribute"
  fi

  log v "3. attempting to map it anyway via PATCH .../mapping (expecting rejection)"
  local object_type_mapping_index
  object_type_mapping_index="$(find_object_type_mapping_index "${schema_and_mapping}")"
  if [[ -z "${object_type_mapping_index}" ]]; then
    log v "no existing objectTypeMapping found for ${OBJECT_TYPE_NAME} - creating one"
  fi

  local updated_mapping
  updated_mapping="$(build_updated_mapping "${schema_and_mapping}" "${object_type_mapping_index}" "${attribute_id}")"
  log vv "patched mapping body:\n${updated_mapping}"

  local patch_response
  patch_response="$("${CURL_ATLASSIAN}" "assets/importsource/${import_source_id}/mapping" \
    --request PATCH --data "${updated_mapping}")"
  log vv "patch response:\n${patch_response}"

  local rejection
  rejection="$(clconf --pipe jsonpath \
    "\$.dataValidationErrors[?(@.code=='UNKNOWN_EXTERNAL_ID_MAPPING')]" \
    --first --output json \
    <<< "${patch_response}" 2>/dev/null)"

  if [[ -n "${rejection}" ]]; then
    log v "REPRODUCED: mapping rejected with UNKNOWN_EXTERNAL_ID_MAPPING\n${rejection}"
    exit 0
  fi

  log v "NOT REPRODUCED: mapping was NOT rejected as expected.\n${patch_response}\nThis may mean the bug is fixed - OR the mapping just changed for real. Check the import source's mapping configuration and revert if this wasn't intended."
  exit 1
}

main "$@"
