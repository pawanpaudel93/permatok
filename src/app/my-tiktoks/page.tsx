'use client'

import {
  Box,
  Center,
  SimpleGrid,
  VStack,
  Link,
  Alert,
  AlertIcon,
  Spinner,
  Text,
  Stack
} from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { usePersistStore } from '@/lib/store'
import { useEffect, useState } from 'react'
import {
  getTiktoks,
  TiktokType,
  getErrorMessage,
  formatDuration,
  formatDate
} from '@/lib/utils'

export default function MyTiktoks() {
  const { userData } = usePersistStore()
  const [isLoading, setIsLoading] = useState(true)
  const [cursor, setCursor] = useState('')
  const [tiktoks, setTiktoks] = useState<TiktokType[]>([])
  const [hasNextPage, setHasNextPage] = useState(true)

  useEffect(() => {
    if (userData?.contract_id) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.contract_id])

  async function fetchData() {
    setIsLoading(true)
    try {
      const response = await getTiktoks(
        userData?.contract_id as string,
        hasNextPage,
        cursor
      )
      setHasNextPage(response.hasNextPage)
      setCursor(response.cursor)
      setTiktoks((oldTiktoks) => [...oldTiktoks, ...response.tiktoks])
    } catch (e) {
      console.log(getErrorMessage(e))
    }
    setIsLoading(false)
  }

  return (
    <Center>
      {tiktoks.length > 0 && (
        <Box
          width={{
            base: '100%',
            md: '80%',
            lg: '60%'
          }}
          boxShadow="lg"
          rounded="md"
          p={4}
          bg="white"
        >
          <InfiniteScroll
            dataLength={tiktoks.length}
            next={fetchData}
            hasMore={hasNextPage && !isLoading}
            loader={
              <Center mt={4}>
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="blue.500"
                  size="xl"
                />
              </Center>
            }
            endMessage={
              <Center mt={4}>
                <Text fontWeight="bold">No more saved TikToks...</Text>
              </Center>
            }
          >
            <SimpleGrid
              columns={{
                sm: 1
              }}
              spacing={4}
            >
              {tiktoks.map((tiktok: TiktokType) => (
                <Box key={tiktok.id} p={4} bg="gray.100" rounded="md">
                  <VStack align="center" spacing={2}>
                    <Stack direction={['column', 'row']}>
                      <Link
                        href={tiktok.archivedUrl}
                        color="blue"
                        wordBreak="break-all"
                        isExternal
                      >
                        Saved TikTok Link
                      </Link>
                      <Link
                        href={tiktok.video?.url}
                        color="blue"
                        wordBreak="break-all"
                        isExternal
                      >
                        Original TikTok Link
                      </Link>
                    </Stack>
                    <Text align="center">{tiktok.video?.description}</Text>
                    <Stack direction={['column', 'row']} spacing={4}>
                      <Stack direction={['column', 'row']} spacing={4}>
                        <VStack spacing={1}>
                          <Text fontWeight="bold">Username:</Text>
                          <Link
                            href={`https://tiktok.com/@${tiktok.video?.username}`}
                            color="blue"
                            isExternal
                          >
                            @{tiktok.video?.username}
                          </Link>
                        </VStack>
                        <VStack spacing={1}>
                          <Text fontWeight="bold">Duration:</Text>
                          <Text>
                            {formatDuration(tiktok.video?.duration as number)}
                          </Text>
                        </VStack>
                      </Stack>
                      <Stack direction={['column', 'row']} spacing={4}>
                        <VStack spacing={1}>
                          <Text fontWeight="bold">Created:</Text>
                          <Text>
                            {formatDate(tiktok.video?.created as number)}
                          </Text>
                        </VStack>
                        <VStack spacing={1}>
                          <Text fontWeight="bold">Saved:</Text>
                          <Text>{formatDate(tiktok.timestamp)}</Text>
                        </VStack>
                      </Stack>
                    </Stack>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </InfiniteScroll>
        </Box>
      )}
      {tiktoks.length === 0 && isLoading && hasNextPage && (
        <Center mt={4}>
          <VStack>
            <Text>Loading your saved TikToks...</Text>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
          </VStack>
        </Center>
      )}
      {tiktoks.length === 0 && !isLoading && !hasNextPage && (
        <Center mt={4}>
          <Alert status="info">
            <AlertIcon />
            No saved TikToks found
          </Alert>
        </Center>
      )}
    </Center>
  )
}
