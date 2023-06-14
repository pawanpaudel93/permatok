import {
  SendTransactionBundlrProps,
  SendTransactionBundlrReturnProps
} from 'othent'
import { type GetTokenSilentlyVerboseResponse } from '@auth0/auth0-spa-js'
import { APP_NAME, APP_VERSION } from './constants'
import { createHash } from 'crypto'
import { Video } from './tiktok'

export async function sendTransactionBundlr(
  params: SendTransactionBundlrProps
): Promise<SendTransactionBundlrReturnProps> {
  const data = params.data

  const blob = new Blob([data])

  const formData = new FormData()

  formData.append('file', blob)
  formData.append('dataHashJWT', params.JWT)
  formData.append('API_ID', process.env.NEXT_PUBLIC_OTHENT_API_ID as string)
  formData.append('tags', JSON.stringify(params.tags))

  const response = await fetch('https://server.othent.io/upload-data-bundlr', {
    method: 'POST',
    body: formData
  })
  return response.json()
}

async function toHash(data: Buffer): Promise<string> {
  const hashBuffer = createHash('sha256').update(data).digest()
  const hashHex = hashBuffer.toString('hex')
  return hashHex
}

export async function prepareFile(
  data: Video,
  url: string,
  timestamp: number,
  address: string
) {
  const { url: downloadUrl, username, description, duration, created } = data
  const bufferData = Buffer.from(await (await fetch(downloadUrl)).arrayBuffer())
  const hash = await toHash(bufferData)

  const tags = [
    { name: 'App-Name', value: APP_NAME },
    { name: 'App-Version', value: APP_VERSION },
    { name: 'Content-Type', value: 'video/mp4' },
    { name: 'File-Hash', value: hash },
    { name: 'Timestamp', value: String(timestamp) },
    { name: 'Uploader', value: address },
    { name: 'tiktok:url', value: url },
    { name: 'tiktok:username', value: username },
    { name: 'tiktok:description', value: description },
    { name: 'tiktok:duration', value: String(duration) },
    { name: 'tiktok:created', value: String(created) }
  ]
  return { data: bufferData, tags }
}

export async function uploadToBundlr(
  data: Buffer | string,
  tags: any,
  accessToken: GetTokenSilentlyVerboseResponse
): Promise<string> {
  const response = await sendTransactionBundlr({
    data: data as unknown as Buffer,
    JWT: accessToken.id_token,
    tags
  })
  if (response.success) {
    return response.transactionId
  } else {
    return await uploadToBundlr(data, tags, accessToken)
  }
}
