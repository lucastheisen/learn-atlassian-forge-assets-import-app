import { generateWebTriggerToken } from './lib/webtrigger-token.js'

const secret = process.env.FORGE_WEBTRIGGER_SECRET || "this-is-a-super-secret";

console.log(await generateWebTriggerToken(secret));
