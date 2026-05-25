import { writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { JSONSchema4 } from 'json-schema';
import { readPatchedSchema } from './lib/schema.js'

// json-schema-to-typescript is CommonJS so we need an adapter layer:
//   https://github.com/bcherny/json-schema-to-typescript/issues/551
const require = createRequire(import.meta.url)
const jsonSchemaToTypescript = require('json-schema-to-typescript') as typeof import('json-schema-to-typescript')

const SCHEMA_VERSION = '2023_10_19'
const JSON_SCHEMA = `https://api.atlassian.com/jsm/assets/imports/external/schema/versions/${SCHEMA_VERSION}`

const ROOT_DIR = dirname(fileURLToPath(import.meta.url))
const schemaFile = join(ROOT_DIR, '..', 'openapi', `assets-schema-and-mapping.${SCHEMA_VERSION}.json`)
const patchFile = join(ROOT_DIR, '..', 'openapi', `assets-schema-and-mapping.${SCHEMA_VERSION}.patch.json`)
const outputFile = join(ROOT_DIR, '..', 'src', 'lib', 'assets-schema-and-mapping.d.ts')

async function main(): Promise<void> {
  const finalDoc = await readPatchedSchema<JSONSchema4>(
    schemaFile,
    JSON_SCHEMA,
    patchFile)

  const types = await jsonSchemaToTypescript.compile(
    finalDoc,
    'AssetsSchemaAndMapping',
    { bannerComment: '' })

  await writeFile(outputFile, types, 'utf8')
}

await main()
