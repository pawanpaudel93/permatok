import { APP_NAME, APP_VERSION } from './constants'
import { Video } from './tiktok'
import { sha256 } from 'crypto-hash'
import { getOthent } from './utils'

export async function prepareFile(
  data: Video,
  url: string,
  timestamp: number,
  address: string
) {
  const { url: downloadUrl, username, description, duration, created } = data
  const bufferData = Buffer.from(await (await fetch(downloadUrl)).arrayBuffer())
  const hash = await sha256(bufferData)

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
  return { data: bufferData, tags, hash }
}

export async function uploadToBundlr(
  data: Buffer,
  tags: any,
  idToken: string
): Promise<string> {
  const othent = await getOthent()
  const response = await othent.sendTransactionBundlr({
    data,
    JWT: idToken,
    tags
  })
  if (response.success) {
    return response.transactionId
  } else {
    return await uploadToBundlr(data, tags, idToken)
  }
}
