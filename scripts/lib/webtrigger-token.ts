import { createSecretKey } from 'node:crypto'
import { SignJWT } from 'jose'

// Implements JWT generation for the web trigger authentication approach
// documented here:
//   https://github.com/ibuchanan/explore-forge-jira-custom-api/blob/main/specs/bullet4-webtrigger-auth.md
// This code is inspired by the associated tests:
//   https://github.com/ibuchanan/explore-forge-jira-custom-api/blob/main/apps/webtrigger/tests/workitem/test-helpers.ts
// and the consumer is inspired by:
//   https://github.com/ibuchanan/explore-forge-jira-custom-api/blob/main/apps/webtrigger/src/workitem/auth.ts
//
// claims must match what src/resolvers/webtrigger/auth.ts requires. Definition
// of these claims can be found here:
//   https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.3
const AUDIENCE = 'write:workitem:custom'
const ISSUER = 'https://lucastheisen.com'
const EXPIRES_IN = '15m'

export async function generateWebTriggerToken(secret: string): Promise<string> {
  const secretKey = createSecretKey(secret, 'utf-8')
  return await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setAudience(AUDIENCE)
    .setIssuer(ISSUER)
    .setExpirationTime(EXPIRES_IN)
    .setIssuedAt()
    .sign(secretKey)
}
