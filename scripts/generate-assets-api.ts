import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import openapiTS, { astToString, type OpenAPI3 } from 'openapi-typescript'
import { readPatchedSchema } from './lib/schema.js'

const API_VERSION = 'v3'
const VERSION = '1.135.77'
const JSON_SCHEMA = `https://dac-static.atlassian.com/cloud/assets/swagger.${API_VERSION}.json?_v=${VERSION}`

const ROOT_DIR = dirname(fileURLToPath(import.meta.url))
const patchFile = join(ROOT_DIR, "..", "openapi", `assets-api.swagger.${API_VERSION}.${VERSION}.patch.json`)
const schemaFile = join(ROOT_DIR, "..", "openapi", `assets-api.swagger.${API_VERSION}.${VERSION}.json`)
const outputFile = join(ROOT_DIR, "..", "src", "lib", 'assets-api.d.ts')

async function main(): Promise<void> {
  const finalDoc = await readPatchedSchema<OpenAPI3>(
    schemaFile,
    JSON_SCHEMA,
    patchFile)

  const ast = await openapiTS(finalDoc)
  const types = astToString(ast)
  await writeFile(outputFile, types, 'utf8')
}

await main()
