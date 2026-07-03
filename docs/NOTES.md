# Notes

## Links

* [Quotas and Limits](https://developer.atlassian.com/platform/forge/platform-quotas-and-limits/)
* [Invocation limits](https://developer.atlassian.com/platform/forge/limits-invocation/)
* [Forge platform pricing](https://developer.atlassian.com/platform/forge/forge-platform-pricing/)
* [Use custom entities to store structured data](https://developer.atlassian.com/platform/forge/custom-entities-store-structured-data/): example of using kvs to store data
* [Which assets import tutorial is the most up to date recommendation for using async queues?](https://community.developer.atlassian.com/t/which-assets-import-tutorial-is-the-most-up-to-date-recommendation-for-using-async-queues/100308/2)
* [How can i enable the “Edit mapping” feature on a custom asset import app](https://community.developer.atlassian.com/t/how-can-i-enable-the-edit-mapping-feature-on-a-custom-asset-import-app/100305)

## Safe observability for request/response debugging

Early development relied on logging full request/response bodies and headers (see `src/lib/forge-clients.ts` and `src/lib/schema-mapping.ts` in git history at `archive/logging-safety-valve`) to see what the Assets API was actually receiving and returning while building the schema/mapping and worker code.
That got removed because this app moves externally-sourced user data (names, emails, phone numbers, etc.), so a blanket payload dump is exactly where that data leaks into Forge's log stream — see `AGENTS.md` > Logging.

The underlying developer need is still real: sometimes you need to see what the data actually looks like to debug a mapping or API issue.
This needs a new approach that doesn't risk leaking real production data, e.g. an opt-in debug mode gated to non-production environments, or a redaction/truncation step that shows shape/structure without real values.
Not designed yet — solve it when a concrete debugging need makes the gap painful, rather than speculatively.

## Re-examine countRecords' "one key, array value" assumption

`countRecords` in `src/lib/kv-upload.ts` requires each `upload-data` chunk to have exactly one top-level key whose value is an array, used to count records for manifest totals.
That's validation this app's own webtrigger imposes on upload chunks — it is not a documented requirement of the Assets API's `/importsource/{id}/executions/{id}/data` endpoint itself.

The Assets API's mapping model appears to support a `selector` that can reference a nested path (e.g. `foo.bar`), which implies a single import document could plausibly contain multiple named/nested collections for different object types, not just one flat top-level array.
If that's right, `countRecords`'s constraint may be an early, narrower-than-necessary assumption (possibly from when this app only handled one object type) rather than a real limit.
Not verified against the live API — worth revisiting if/when this app needs to support more than one object type per import, or a nested selector.

## Considerations for User Sync

1. Need to ingest user data
   1. Assets serve as the datastore but have multiple approaches
      1. External import: built in, easy to use, imports all user data safely but does not seem to allow for association with Atlassian user account and doesnt have a post ingest hook
         1. could add user account sync via webook or rest api
            1. this could be re-used in automation action for when user edit occurs like adding user to other asset groups like analysts
      1. Custom import (assetImportType app): full control of import but needs a way to fetch data.  could be s3 import which would work with current user sync automation, or could get direct access to user directory of corp. this has a complicated workflow to ensure obects are updated in a way that doesn't timeout. would allow easy integration of secondary processing (user sync)

## External Import Instructions

I wrote up the process on [this community thread](https://community.developer.atlassian.com/t/utilizing-existing-schema-mappings-and-dynamic-mapping-generation-for-assets-imports/90736/2).

## Updating reference to atlassian user

It appears [atlassian user does reference attributes do not show up in the importsource schema-and-mapping](https://community.developer.atlassian.com/t/how-can-i-get-a-user-reference-attribute-to-synchronize-from-an-incoming-mapping-via-email-address/100676), so we need to do that as an additional step.
[This post](https://community.developer.atlassian.com/t/setting-references-for-assets-via-rest-api-in-jira/70715) indicates that this should be possible, but also makes it clear that the expected value is not always clear.

And this seems to work:

```console
ltheisen@mm292985-pc ~/egit/lucastheisen-learn-atlassian-forge-assets-import-app
$ cat /tmp/setuser.yml
---
attributes:
  - objectTypeAttributeId: "214"
    objectAttributeValues:
      - value: "557058:9c189978-a6aa-4166-a4c7-7067bdaf3809"
objectTypeId: "37"


ltheisen@mm292985-pc ~/egit/lucastheisen-learn-atlassian-forge-assets-import-app
$ ./curl_atlassian.sh     assets/object/1     --silent     --request PUT --data @<(clconf --yaml /tmp/setuser.yml getv / --output json)     | clconf --pipe
_links:
  self: https://api.atlassian.com/jsm/assets/workspace/3380a6d2-092b-493a-a9dc-cf0c5197e23b/v1/object/1
attributes:
- globalId: 3380a6d2-092b-493a-a9dc-cf0c5197e23b:108
  id: "108"
  objectAttributeValues:
  - displayValue: Lucas Theisen
...
```

The problem is how to get the _key_ for a given user by email.
This _key_ appears to be the `accountId` from this search result:

```console
./curl_atlassian.sh jira/user/search?query=ltheisen%40mit | clconf --pipe
```

But as [this community post](https://community.developer.atlassian.com/t/api-to-get-user-exactly-by-email/93265) points out:

> ... this endpoint searches non-strictly and tries to suggest the most suitable options ...

So it looks like the mapping has to be done using `asApp` and done in two parts:

1. Lookup by email to get all matching account ids
1. Lookup email for all matching account ids to confirm exact match

The basic approach is outlined by this (working) web trigger:

```javascript
import api, { route } from '@forge/api';

/**
 * @param {import('@forge/api').WebTriggerRequest} event
 * @param {import('@forge/api').WebTriggerContext} context
 * @returns {Promise<import('@forge/api').WebTriggerResponse>}
 */
exports.runAsync = async (event, context) => {
  // https://developer.atlassian.com/platform/forge/apis-reference/fetch-api-product.requestjira/
  const userSearchParams = new URLSearchParams({
    query: "l",
  });
  const userSearchResponse = await api
    .asApp()
    .requestJira(
      route`/rest/api/3/user/search?${userSearchParams}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      });

  console.log('status:', userSearchResponse.status);
  console.log('ok:', userSearchResponse.ok);
  const users = await userSearchResponse.json();

  console.log('users:', JSON.stringify(users, null, 2));
  const accountIds = users.map((user) => user.accountId);

  const emailLookupParams = new URLSearchParams();
  accountIds.forEach(val => {
    emailLookupParams.append('accountId', val);
  });
  const emailLookupResponse = await api
    .asApp()
    .requestJira(
      route`/rest/api/3/user/email/bulk?${emailLookupParams}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      });

  console.log('status:', emailLookupResponse.status);
  console.log('ok:', emailLookupResponse.ok);
  const emailLookup = await emailLookupResponse.json();
  console.log('emailLookup:', JSON.stringify(emailLookup, null, 2));

  return {
    outputKey: "status-ok"
  };
};
```
