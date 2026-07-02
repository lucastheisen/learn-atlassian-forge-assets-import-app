import { generateWebTriggerToken } from './webtrigger-token.js'

export interface WebTriggerResponse {
  status: number
  title: string
}

export interface WebTriggerConnection {
  url: string
  secret: string
}

export async function callWebTrigger(
  action: Record<string, unknown>,
  { url, secret }: WebTriggerConnection,
): Promise<WebTriggerResponse> {
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
