import { Othent, useOthentReturnProps } from 'othent'
import { createAuth0Client } from '@auth0/auth0-spa-js'
import { sha256 } from 'crypto-hash'
import { APP_NAME, APP_VERSION } from './constants'
import axios from 'axios'
import { Video } from './tiktok'

export interface ArchiveType {
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

const getAuth0Client = () =>
  createAuth0Client({
    domain: 'othent.us.auth0.com',
    clientId: 'dyegx4dZj5yOv0v0RkoUsc48CIqaNS6C',
    authorizationParams: {
      redirect_uri: window.location.origin
    }
  })

export async function getAccessToken() {
  const auth0 = await getAuth0Client()

  const file_hash = await sha256(new Uint8Array([]))

  const authParams = {
    transaction_input: JSON.stringify({
      othentFunction: 'uploadData',
      file_hash
    })
  }
  const accessToken = await auth0.getTokenSilently({
    detailedResponse: true,
    authorizationParams: authParams
  })
  return accessToken
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
          edges: archivedTransactions,
          pageInfo: { hasNextPage }
        }
      }
    }
  } = await axios.post('https://arweave.net/graphql', query, {
    headers: { 'Content-Type': 'application/json' }
  })
  cursor = archivedTransactions[archivedTransactions.length - 1]?.cursor
  return { archivedTransactions, cursor, hasNextPage }
}

export const getArchives = async (
  walletAddress: string,
  hasNextPage: boolean,
  cursor: string
): Promise<{
  archives: ArchiveType[]
  hasNextPage: boolean
  cursor: string
}> => {
  const archives: ArchiveType[] = []
  const result = await query({ first: 100, cursor, walletAddress })
  hasNextPage = result.hasNextPage
  cursor = result.cursor ?? ''
  if (result.archivedTransactions.length > 0) {
    archives.push(
      ...result.archivedTransactions.map(
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
  return { archives, hasNextPage, cursor }
}

export const searchArchives = async (
  url: string,
  hasNextPage: boolean,
  cursor: string
): Promise<{
  archives: ArchiveType[]
  hasNextPage: boolean
  cursor: string
}> => {
  const archives: ArchiveType[] = []
  const result = await query({ first: 100, cursor, url })
  hasNextPage = result.hasNextPage
  cursor = result.cursor ?? ''
  if (result.archivedTransactions.length > 0) {
    archives.push(
      ...result.archivedTransactions.map(
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
  return { archives, hasNextPage, cursor }
}

export const getArchive = async (url: string): Promise<ArchiveType> => {
  let archive: ArchiveType = {
    id: '',
    url: '',
    archivedUrl: '',
    timestamp: 0
  }
  try {
    const result = await query({ first: 1, url })
    if (result.archivedTransactions.length > 0) {
      const transaction = result.archivedTransactions[0] as {
        node: { tags: Tag[]; id: string }
      }
      const { id, tags } = transaction.node
      archive = {
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
  return archive
}

export const getAllArchives = async (
  walletAddress: string
): Promise<ArchiveType[]> => {
  const archives: ArchiveType[] = []
  let hasNextPage = true
  let cursor = ''
  while (hasNextPage) {
    const result = await getArchives(walletAddress, hasNextPage, cursor)
    hasNextPage = result.hasNextPage
    cursor = result.cursor
  }
  return archives
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
