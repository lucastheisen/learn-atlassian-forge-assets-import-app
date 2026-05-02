# Notes

## Links

* [Quotas and Limits](https://developer.atlassian.com/platform/forge/platform-quotas-and-limits/)
* [Invocation limits](https://developer.atlassian.com/platform/forge/limits-invocation/)
* [Forge platform pricing](https://developer.atlassian.com/platform/forge/forge-platform-pricing/)
* [Use custom entities to store structured data](https://developer.atlassian.com/platform/forge/custom-entities-store-structured-data/): example of using kvs to store data, should show how to store config (setSecret) for aws s3 keys in user sync config
* [Which assets import tutorial is the most up to date recommendation for using async queues?](https://community.developer.atlassian.com/t/which-assets-import-tutorial-is-the-most-up-to-date-recommendation-for-using-async-queues/100308/2)
* [How can i enable the “Edit mapping” feature on a custom asset import app](https://community.developer.atlassian.com/t/how-can-i-enable-the-edit-mapping-feature-on-a-custom-asset-import-app/100305)

## Getting Started

Follow [these instructions](https://developer.atlassian.com/platform/forge/getting-started/) to set up `node` and `forge`.

## Considerations for User Sync

1. Need to ingest user data
   1. Assets serve as the datastore but have multiple approaches
      1. External import: built in, easy to use, imports all user data safely but does not seem to allow for association with Atlassian user account and doesnt have a post ingest hook
         1. could add user account sync via webook or rest api
            1. this could be re-used in automation action for when user edit occurs like adding user to other asset groups like analysts
      1. Custom import (assetImportType app): full control of import but needs a way to fetch data.  could be s3 import which would work with current user sync automation, or could get direct access to user directory of corp. this has a complicated workflow to ensure obects are updated in a way that doesn't timeout. would allow easy integration of secondary processing (user sync)

## External Import Instructions

I wrote up the process on [this community thread](https://community.developer.atlassian.com/t/utilizing-existing-schema-mappings-and-dynamic-mapping-generation-for-assets-imports/90736/2).

## Invalidating External Import Token

Generating a new external import token will indeed invalidate a token. This can be tested by running:

```bash
curl \
  --header "Accept: application/json" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $(cat token.txt)" \
  --silent \
  https://api.atlassian.com/jsm/assets/v1/imports/info \
  | clconf --pipe
```

Then generate a new token and see that you get a 401:

```console
ltheisen@ltt16g3 ~/git/lucastheisen/learn-atlassian-forge-assets-import-app
$ curl --header "Accept: application/json" --header "Content-Type: application/json" --header "Authorization: Bearer $(cat token.txt)" --silent https://api.atlassian.com/jsm/assets
/v1/imports/info | clconf --pipe
links:
  getStatus: https://api.atlassian.com/jsm/assets/workspace/3380a6d2-092b-493a-a9dc-cf0c5197e23b/v1/importsource/c1b22947-5e71-48b7-9238-add56a74863c/configstatus
  mapping: https://api.atlassian.com/jsm/assets/workspace/3380a6d2-092b-493a-a9dc-cf0c5197e23b/v1/importsource/c1b22947-5e71-48b7-9238-add56a74863c/mapping
  start: https://api.atlassian.com/jsm/assets/workspace/3380a6d2-092b-493a-a9dc-cf0c5197e23b/v1/importsource/c1b22947-5e71-48b7-9238-add56a74863c/executions

ltheisen@ltt16g3 ~/git/lucastheisen/learn-atlassian-forge-assets-import-app
$ curl --header "Accept: application/json" --header "Content-Type: application/json" --header "Authorization: Bearer $(cat token.txt)" --silent https://api.atlassian.com/jsm/assets
/v1/imports/info | clconf --pipe
code: 401
message: Unauthorized
```
