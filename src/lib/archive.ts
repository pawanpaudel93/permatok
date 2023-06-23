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
  return { data: bufferData, tags }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function uploadToBundlr(data: Buffer, tags: any): Promise<string> {
  const othent = await getOthent()
  const signedTx = await othent.signTransactionBundlr({
    othentFunction: 'uploadData',
    data,
    tags
  })

  const maxRetries = 3
  let retries = 0

  while (retries < maxRetries) {
    const response = await othent.sendTransactionBundlr(signedTx)
    if (response.success) {
      return response.transactionId
    } else {
      retries++
      await delay(1000) // Add a delay of 1 second before retrying
    }
  }

  throw new Error('Failed to upload TikTok to Arweave after multiple retries.')
}
