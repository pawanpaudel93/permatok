import { Othent, useOthentReturnProps } from 'othent'
import { APP_NAME, APP_VERSION } from './constants'
import axios from 'axios'
import { Video } from './tiktok'

export interface TiktokType {
  id: string
  url: string
  archivedUrl: string
  timestamp: number
  video?: Video
}

interface Tag {
  name: string
  value: string
  key?: string
}

let othent: useOthentReturnProps

export function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
    return (error as { message: string }).message

  try {
    return new Error(JSON.stringify(error)).message
  } catch {
    return String(error)
  }
}

export async function getOthent(apiid?: string) {
  if (othent) return othent
  othent = await Othent({
    API_ID: apiid || (process.env.NEXT_PUBLIC_OTHENT_API_ID as string),
    callbackURLs: [window.location.origin]
  })
  return othent
}

const query = async ({
  first,
  cursor,
  walletAddress,
  url
}: {
  first: number
  cursor?: string
  walletAddress?: string
  url?: string
}) => {
  const query = {
    query: `
          query {
              transactions(
                  first: ${first},
                  ${cursor ? `after: "${cursor}",` : ''}
                  tags: [
                      { name: "App-Name", values: ["${APP_NAME}"] }
                      { name: "App-Version", values: ["${APP_VERSION}"]}
                      ${
                        walletAddress
                          ? `{ name: "Uploader", values: ["${walletAddress}"]}`
                          : ''
                      }
                      ${
                        url
                          ? `{name: "tiktok:url", values: ["${url}", "${url}/"]}`
                          : ''
                      }
                  ]
              ) {
                  pageInfo { 
                      hasNextPage
                  }
                  edges {
                      cursor
                      node {
                          id
                          tags {
                              name
                              value
                          }
                      }
                  }
              }
          }
      `
  }
  const {
    data: {
      data: {
        transactions: {
          edges: tiktokTransactions,
          pageInfo: { hasNextPage }
        }
      }
    }
  } = await axios.post('https://arweave.net/graphql', query, {
    headers: { 'Content-Type': 'application/json' }
  })
  cursor = tiktokTransactions[tiktokTransactions.length - 1]?.cursor
  return { tiktokTransactions, cursor, hasNextPage }
}

export const getTiktoks = async (
  walletAddress: string,
  hasNextPage: boolean,
  cursor: string
): Promise<{
  tiktoks: TiktokType[]
  hasNextPage: boolean
  cursor: string
}> => {
  const tiktoks: TiktokType[] = []
  const result = await query({ first: 100, cursor, walletAddress })
  hasNextPage = result.hasNextPage
  cursor = result.cursor ?? ''
  if (result.tiktokTransactions.length > 0) {
    tiktoks.push(
      ...result.tiktokTransactions.map(
        (transaction: { node: { tags: Tag[]; id: string } }) => {
          const { id, tags } = transaction.node
          return {
            id,
            url: tags[6]?.value ?? '',
            archivedUrl: `https://arweave.net/${id}`,
            timestamp: parseInt(tags[4]?.value ?? '0'),
            video: {
              url: tags[6]?.value ?? '',
              username: tags[7]?.value ?? '',
              description: tags[8]?.value ?? '',
              duration: parseInt(tags[9]?.value ?? '0'),
              created: parseInt(tags[10]?.value ?? '0')
            }
          }
        }
      )
    )
  }
  return { tiktoks, hasNextPage, cursor }
}

export const searchTiktoks = async (
  url: string,
  hasNextPage: boolean,
  cursor: string
): Promise<{
  tiktoks: TiktokType[]
  hasNextPage: boolean
  cursor: string
}> => {
  const tiktoks: TiktokType[] = []
  const result = await query({ first: 100, cursor, url })
  hasNextPage = result.hasNextPage
  cursor = result.cursor ?? ''
  if (result.tiktokTransactions.length > 0) {
    tiktoks.push(
      ...result.tiktokTransactions.map(
        (transaction: { node: { tags: Tag[]; id: string } }) => {
          const { id, tags } = transaction.node
          return {
            id,
            url: tags[6]?.value ?? '',
            archivedUrl: `https://arweave.net/${id}`,
            timestamp: parseInt(tags[4]?.value ?? '0'),
            video: {
              url: tags[6]?.value ?? '',
              username: tags[7]?.value ?? '',
              description: tags[8]?.value ?? '',
              duration: parseInt(tags[9]?.value ?? '0'),
              created: parseInt(tags[10]?.value ?? '0')
            }
          }
        }
      )
    )
  }
  return { tiktoks, hasNextPage, cursor }
}

export const getTiktok = async (url: string): Promise<TiktokType> => {
  let tiktok: TiktokType = {
    id: '',
    url: '',
    archivedUrl: '',
    timestamp: 0
  }
  try {
    const result = await query({ first: 1, url })
    if (result.tiktokTransactions.length > 0) {
      const transaction = result.tiktokTransactions[0] as {
        node: { tags: Tag[]; id: string }
      }
      const { id, tags } = transaction.node
      tiktok = {
        id,
        url: tags[6]?.value ?? '',
        archivedUrl: `https://arweave.net/${id}`,
        timestamp: parseInt(tags[4]?.value ?? '0'),
        video: {
          url: tags[6]?.value ?? '',
          username: tags[7]?.value ?? '',
          description: tags[8]?.value ?? '',
          duration: parseInt(tags[9]?.value ?? '0'),
          created: parseInt(tags[10]?.value ?? '0')
        }
      }
    }
  } catch (error) {}
  return tiktok
}

export const getAllTiktoks = async (
  walletAddress: string
): Promise<TiktokType[]> => {
  const tiktoks: TiktokType[] = []
  let hasNextPage = true
  let cursor = ''
  while (hasNextPage) {
    const result = await getTiktoks(walletAddress, hasNextPage, cursor)
    hasNextPage = result.hasNextPage
    cursor = result.cursor
  }
  return tiktoks
}

function getMonthName(month: number) {
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]

  return monthNames[month - 1]
}

export function formatDate(timestamp: number) {
  const date = new Date(timestamp * 1000)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${day} ${getMonthName(month)} ${year} ${hours}:${minutes}`
}

export function formatDuration(duration: number) {
  const seconds = Math.floor(duration / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${
    minutes > 0 ? minutes + ' minutes ' : ''
  }${remainingSeconds} seconds`
}
