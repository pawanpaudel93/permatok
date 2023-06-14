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
  convertDuration,
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
    <Center mt="100px">
      {archives.length > 0 ? (
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
              <p style={{ textAlign: 'center', marginTop: '5px' }}>
                <h4>Loading more TikToks...</h4>
              </p>
            }
            endMessage={
              <p style={{ textAlign: 'center', marginTop: '5px' }}>
                <b>No more saved TikToks...</b>
              </p>
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
                      <VStack>
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
                        <HStack>
                          <Box>
                            <b>Username:</b>&nbsp;
                            <Link
                              href={`https://tiktok.com/@${archive.video?.username}`}
                              color="blue"
                              isExternal
                            >
                              @{archive.video?.username}
                            </Link>
                          </Box>
                          <Text>
                            <b>Duration:</b>&nbsp;
                            {convertDuration(archive.video?.duration as number)}
                          </Text>
                          <Text>
                            <b>Created:</b>&nbsp;
                            {formatDate(archive.video?.created as number)}
                          </Text>
                          <Text>
                            <b>Saved:</b>&nbsp;
                            {formatDate(archive.timestamp)}
                          </Text>
                        </HStack>
                      </VStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </InfiniteScroll>
        </TableContainer>
      ) : (
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
      )}
      {archives.length === 0 && !isLoading && (
        <Center mt={20}>
          <Alert status="info">
            <AlertIcon />
            No saved TikToks found
          </Alert>
        </Center>
      )}
    </Center>
  )
}
