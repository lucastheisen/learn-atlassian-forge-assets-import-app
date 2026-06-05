import { createSecretKey } from 'node:crypto'
import { SignJWT } from "jose";

// Implements JWT generation for the web trigger authentication approach
// documented here:
//   https://github.com/ibuchanan/explore-forge-jira-custom-api/blob/main/specs/bullet4-webtrigger-auth.md
// This code is inspired by the associated tests:
//   https://github.com/ibuchanan/explore-forge-jira-custom-api/blob/main/apps/webtrigger/tests/workitem/test-helpers.ts
// and the consumer is inspired by:
//   https://github.com/ibuchanan/explore-forge-jira-custom-api/blob/main/apps/webtrigger/src/workitem/auth.ts

const secret = process.env.FORGE_WEBTRIGGER_SECRET || "this-is-a-super-secret";

// definition of these claims can be found here:
//   https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.3
const audience = "write:workitem:custom";
const issuer = "https://lucastheisen.com";
const expiresIn = "15m";
const issuedAt = undefined;

const secretKey = createSecretKey(secret, "utf-8");
const builder = new SignJWT({})
  .setProtectedHeader({ alg: "HS256" })
  .setAudience(audience)
  .setIssuer(issuer)
  .setExpirationTime(expiresIn);

if (issuedAt !== undefined) {
  builder.setIssuedAt(issuedAt);
} else {
  builder.setIssuedAt();
}

console.log(await builder.sign(secretKey));
