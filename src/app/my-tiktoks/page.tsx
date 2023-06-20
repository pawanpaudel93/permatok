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
  getArchives,
  ArchiveType,
  getErrorMessage,
  formatDuration,
  formatDate
} from '@/lib/utils'

export default function MyArchives() {
  const { userData } = usePersistStore()
  const [isLoading, setIsLoading] = useState(true)
  const [cursor, setCursor] = useState('')
  const [archives, setArchives] = useState<ArchiveType[]>([])
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
      const response = await getArchives(
        userData?.contract_id as string,
        hasNextPage,
        cursor
      )
      setHasNextPage(response.hasNextPage)
      setCursor(response.cursor)
      setArchives((oldArchives) => [...oldArchives, ...response.archives])
    } catch (e) {
      console.log(getErrorMessage(e))
    }
    setIsLoading(false)
  }

  return (
    <Center>
      {archives.length > 0 && (
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
            dataLength={archives.length}
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
              {archives.map((archive: ArchiveType) => (
                <Box key={archive.id} p={4} bg="gray.100" rounded="md">
                  <VStack align="center" spacing={2}>
                    <Stack direction={['column', 'row']}>
                      <Link
                        href={archive.archivedUrl}
                        color="blue"
                        wordBreak="break-all"
                        isExternal
                      >
                        Saved TikTok Link
                      </Link>
                      <Link
                        href={archive.video?.url}
                        color="blue"
                        wordBreak="break-all"
                        isExternal
                      >
                        Original TikTok Link
                      </Link>
                    </Stack>
                    <Text align="center">{archive.video?.description}</Text>
                    <Stack direction={['column', 'row']} spacing={4}>
                      <Stack direction={['column', 'row']} spacing={4}>
                        <VStack spacing={1}>
                          <Text fontWeight="bold">Username:</Text>
                          <Link
                            href={`https://tiktok.com/@${archive.video?.username}`}
                            color="blue"
                            isExternal
                          >
                            @{archive.video?.username}
                          </Link>
                        </VStack>
                        <VStack spacing={1}>
                          <Text fontWeight="bold">Duration:</Text>
                          <Text>
                            {formatDuration(archive.video?.duration as number)}
                          </Text>
                        </VStack>
                      </Stack>
                      <Stack direction={['column', 'row']} spacing={4}>
                        <VStack spacing={1}>
                          <Text fontWeight="bold">Created:</Text>
                          <Text>
                            {formatDate(archive.video?.created as number)}
                          </Text>
                        </VStack>
                        <VStack spacing={1}>
                          <Text fontWeight="bold">Saved:</Text>
                          <Text>{formatDate(archive.timestamp)}</Text>
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
      {archives.length === 0 && isLoading && hasNextPage && (
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
      {archives.length === 0 && !isLoading && !hasNextPage && (
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
