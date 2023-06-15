'use client'

import {
  Td,
  Table,
  TableContainer,
  Tbody,
  Tr,
  Center,
  VStack,
  Link,
  Alert,
  AlertIcon,
  Spinner,
  Text,
  HStack,
  Box
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
        <TableContainer
          width={{
            base: '100%',
            md: '80%',
            lg: '60%'
          }}
          maxW="100%"
        >
          <InfiniteScroll
            dataLength={archives.length}
            next={fetchData}
            hasMore={hasNextPage && !isLoading}
            loader={
              <Center mt="5px">
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
              <Center mt="5px">
                <Text fontWeight="bold">No more saved TikToks...</Text>
              </Center>
            }
          >
            <Table variant="striped">
              <Tbody>
                {archives.map((archive: ArchiveType) => (
                  <Tr key={archive.id}>
                    <Td
                      overflow="hidden"
                      whiteSpace="break-spaces"
                      textOverflow="ellipsis"
                    >
                      <VStack align="center" spacing={2}>
                        <Link
                          href={archive.archivedUrl}
                          color="blue"
                          isExternal
                        >
                          {archive.archivedUrl}
                        </Link>
                        <Link href={archive.video?.url} color="blue" isExternal>
                          {archive.video?.url}
                        </Link>
                        <Text>{archive.video?.description}</Text>
                        <HStack align="center" spacing={4}>
                          <Box>
                            <Text fontWeight="bold">Username:</Text>
                            <Link
                              href={`https://tiktok.com/@${archive.video?.username}`}
                              color="blue"
                              isExternal
                            >
                              @{archive.video?.username}
                            </Link>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Duration:</Text>
                            <Text>
                              {formatDuration(
                                archive.video?.duration as number
                              )}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Created:</Text>
                            <Text>
                              {formatDate(archive.video?.created as number)}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Saved:</Text>
                            <Text>{formatDate(archive.timestamp)}</Text>
                          </Box>
                        </HStack>
                      </VStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </InfiniteScroll>
        </TableContainer>
      )}
      {archives.length === 0 && isLoading && hasNextPage && (
        <Center>
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
