import { callWebTrigger, type WebTriggerResponse } from './lib/webtrigger-client.js'

// deterministic chunk sizes spanning 1-5 records so the assertion step
// exercises aggregation (totals.keys / totals.records) across varied shapes,
// not just a single uniform chunk
const CHUNK_SIZES = [1, 3, 5, 2, 4]

function buildUsersChunk(chunkIndex: number, count: number): Record<string, unknown> {
  return {
    users: Array.from({ length: count }, (_, userIndex) => {
      const id = String(chunkIndex * 10 + userIndex + 1).padStart(3, '0')
      return {
        name: `Smoke User ${id}`,
        active: true,
        first_name: 'Smoke',
        last_name: `User${id}`,
        email: `smoke-user-${id}@example.invalid`,
        phone: '555-0101',
        title: 'Engineer',
      }
    }),
  }
}

async function assertOk(step: string, response: WebTriggerResponse): Promise<void> {
  console.log(`${step}: ${response.status} ${response.title}`)
  if (response.status !== 200) {
    throw new Error(`${step} failed: ${JSON.stringify(response)}`)
  }
}

async function main(): Promise<void> {
  const uploadId = `smoke-${Date.now()}`

  try {
    await assertOk(
      'upload-new',
      await callWebTrigger({ type: 'upload-new', uploadId, testing: true }),
    )

    let expectedRecords = 0
    for (const [index, size] of CHUNK_SIZES.entries()) {
      expectedRecords += size
      await assertOk(
        `upload-data[${index}] (${size} users)`,
        await callWebTrigger({
          type: 'upload-data',
          uploadId,
          index,
          data: buildUsersChunk(index, size),
        }),
      )
    }

    await assertOk('upload-complete', await callWebTrigger({ type: 'upload-complete', uploadId }))

    await assertOk(
      'upload-smoke-assert-latest',
      await callWebTrigger({
        type: 'upload-smoke-assert-latest',
        expectedKeys: CHUNK_SIZES.length,
        expectedRecords,
        expectedTopLevelKey: 'users',
      }),
    )

    console.log(
      `smoke test passed: uploadId=${uploadId} chunks=${CHUNK_SIZES.length} records=${expectedRecords}`,
    )
  } catch (err) {
    console.error(`smoke test failed, aborting upload ${uploadId} for cleanup`)
    await callWebTrigger({ type: 'upload-abort', uploadId }).catch((abortErr: unknown) => {
      console.error(`upload-abort cleanup also failed: ${String(abortErr)}`)
    })
    throw err
  } finally {
    // testing uploads land in their own manifest keyspace (see
    // src/lib/kv-data.ts), so this can never prune real completed imports
    await callWebTrigger({ type: 'prune', keepN: 0, testing: true })
      .then((response) => console.log(`prune (testing): ${response.status} ${response.title}`))
      .catch((pruneErr: unknown) => console.error(`cleanup prune failed: ${String(pruneErr)}`))
  }
}

await main()
