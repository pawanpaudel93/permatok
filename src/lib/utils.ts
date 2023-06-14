import { Othent, useOthentReturnProps } from 'othent'
import { createAuth0Client } from '@auth0/auth0-spa-js'
import { sha256 } from 'crypto-hash'
import { APP_NAME, APP_VERSION, MANIFEST_CONTENT_TYPE } from './constants'
import axios from 'axios'

export interface ArchiveType {
  id: string
  url: string
  archivedUrl: string
  timestamp: number
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

  const file_hash = await sha256(new Uint8Array())

  const authParams = {
    transaction_input: JSON.stringify({
      othentFunction: 'uploadData',
      file_hash: file_hash
    })
  }
  const isAuthenticated = auth0.isAuthenticated()
  if (!isAuthenticated) {
    await auth0.loginWithPopup({
      authorizationParams: authParams
    })
  }
  const accessToken = await auth0.getTokenSilently({
    detailedResponse: true,
    cacheMode: 'off',
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
                      { name: "Content-Type", values: ["${MANIFEST_CONTENT_TYPE}"] }
                      { name: "App-Version", values: ["${APP_VERSION}"]}
                      ${
                        walletAddress
                          ? `{ name: "Uploader", values: ["${walletAddress}"]}`
                          : ''
                      }
                      ${
                        url
                          ? `{name: "Url", values: ["${url}", "${url}/"]}`
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
            url: tags[5]?.value ?? '',
            title: tags[3]?.value ?? '',
            webpage: `https://arweave.net/${id}`,
            screenshot: `https://arweave.net/${id}/screenshot`,
            timestamp: parseInt(tags[6]?.value ?? '0')
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
            url: tags[5]?.value ?? '',
            title: tags[3]?.value ?? '',
            webpage: `https://arweave.net/${id}`,
            screenshot: `https://arweave.net/${id}/screenshot`,
            timestamp: parseInt(tags[6]?.value ?? '0')
          }
        }
      )
    )
  }
  return { archives, hasNextPage, cursor }
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
  const hours = date.getHours()
  const minutes = date.getMinutes()

  return `${day} ${getMonthName(month)} ${year} ${hours}:${minutes}`
}
