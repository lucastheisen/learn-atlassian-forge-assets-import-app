import { generateWebTriggerToken } from './webtrigger-token.js'

export interface WebTriggerResponse {
  status: number
  title: string
}

export async function callWebTrigger(action: Record<string, unknown>): Promise<WebTriggerResponse> {
  const url = process.env.FORGE_WEBTRIGGER_URL
  if (!url) {
    throw new Error('FORGE_WEBTRIGGER_URL environment variable is required')
  }

  const secret = process.env.FORGE_WEBTRIGGER_SECRET
  if (!secret) {
    throw new Error('FORGE_WEBTRIGGER_SECRET environment variable is required')
  }

  const token = await generateWebTriggerToken(secret)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(action),
  })

  const body = (await response.json()) as WebTriggerResponse

  if (response.status !== body.status) {
    throw new Error(
      `webtrigger response status mismatch: http ${response.status} vs body ${JSON.stringify(body)}`,
    )
  }

  return body
}
