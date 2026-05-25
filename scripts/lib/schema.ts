import { constants } from 'node:fs'
import { access, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import type { Operation } from 'fast-json-patch'

// jsonpatch is currently only CommonJS
//   https://github.com/Starcounter-Jack/JSON-Patch/issues/277
// this workaround allows importing commonjs in esm
const require = createRequire(import.meta.url)
const jsonpatch = require('fast-json-patch') as typeof import('fast-json-patch')

async function downloadSchema(url: string): Promise<string> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to download schema: ${response.status} ${response.statusText}`)
  }

  return response.text()
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK)
    return true
  } catch {
    return false
  }
}

async function readPatch(path: string): Promise<Operation[] | undefined> {
  if (!(await fileExists(path))) {
    return undefined
  }

  return JSON.parse(await readFile(path, 'utf8')) as Operation[]
}

export async function readPatchedSchema<T>(path: string, url: string, patchFile: string): Promise<T> {
  const schemaText = await readSchema(path, url)

  const upstreamDoc = JSON.parse(schemaText) as T
  const patch = await readPatch(patchFile)

  return patch === undefined
      ? upstreamDoc
      : jsonpatch.applyPatch(structuredClone(upstreamDoc), patch, true, false).newDocument
}

async function readSchema(path: string, url: string): Promise<string> {
  if (await fileExists(path)) {
    return await readFile(path, 'utf8')
  }

  const schemaText = await downloadSchema(url)
  await writeFile(path, schemaText, 'utf8')

  return schemaText
}
