import { constants } from 'node:fs'
import { access, readdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { basename, dirname, extname, join } from 'node:path'
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

function getPatchFilePrefix(schemaPath: string): { dir: string; stem: string; prefix: string } {
  const dir = dirname(schemaPath)
  const ext = extname(schemaPath)
  const stem = basename(schemaPath, ext)

  return {
    dir,
    stem,
    prefix: `${stem}.patch.`,
  }
}

export function getPatchFileName(schemaPath: string, reason: string): string {
  const { dir, stem } = getPatchFilePrefix(schemaPath)
  return join(dir, `${stem}.patch.${reason}.json`)
}

async function listPatchFiles(schemaPath: string): Promise<string[]> {
  const { dir, prefix } = getPatchFilePrefix(schemaPath)
  const entries = await readdir(dir, { withFileTypes: true })

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.startsWith(prefix) && name.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => join(dir, name))
}

export async function readPatchedSchema<T>(schemaPath: string, url: string): Promise<T> {
  let document = JSON.parse(await readSchema(schemaPath, url)) as T
  for (const patch of await readPatches(schemaPath)) {
    try {
      document = jsonpatch.applyPatch(document, patch.operations, true, false).newDocument
    } catch (error) {
      throw new Error(`Failed to apply patch file "${patch.path}"`, {
        cause: error,
      })
    }
  }
  return document
}

async function readPatch(path: string): Promise<Operation[] | undefined> {
  if (!(await fileExists(path))) {
    return undefined
  }

  return JSON.parse(await readFile(path, 'utf8')) as Operation[]
}

async function readPatches(
  schemaPath: string,
): Promise<Array<{ path: string; operations: Operation[] }>> {
  const patchFiles = await listPatchFiles(schemaPath)
  const patches: Array<{ path: string; operations: Operation[] }> = []

  for (const patchPath of patchFiles) {
    const operations = await readPatch(patchPath)

    if (operations !== undefined) {
      patches.push({ path: patchPath, operations })
    }
  }

  return patches
}

async function readSchema(path: string, url: string): Promise<string> {
  if (await fileExists(path)) {
    return await readFile(path, 'utf8')
  }

  const schemaText = await downloadSchema(url)
  await writeFile(path, schemaText, 'utf8')

  return schemaText
}
