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
  Image,
  Alert,
  AlertIcon,
  Spinner,
  Text,
  Stack
} from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useEffect, useState } from 'react'
import { formatDate, getErrorMessage } from '@/lib/utils'
import { getArchives, ArchiveType } from '@/lib/utils'
import { usePersistStore } from '@/lib/store'

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
      {archives.length > 0 ? (
        <Center>
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
                  <h4>Loading more archives...</h4>
                </p>
              }
              endMessage={
                <p style={{ textAlign: 'center', marginTop: '5px' }}>
                  <b>No more archives...</b>
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
                        <Stack
                          direction={['column', 'row']}
                          justifyContent="space-between"
                        >
                          <VStack width="80%">
                            <Link
                              href={archive.webpage}
                              color="blue"
                              isExternal
                            >
                              {archive.title || archive.webpage}
                            </Link>
                            <Link href={archive.url} isExternal>
                              {archive.url}
                            </Link>
                          </VStack>
                          <VStack>
                            <Link href={archive.screenshot} isExternal>
                              <Image
                                src={archive.screenshot}
                                style={{
                                  cursor: 'pointer'
                                }}
                                boxSize="100px"
                                alt={archive.title}
                              />
                            </Link>
                            <small>{formatDate(archive.timestamp)}</small>
                          </VStack>
                        </Stack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </InfiniteScroll>
          </TableContainer>
        </Center>
      ) : (
        <VStack>
          <Text>Loading your archives...</Text>
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
            No archives found
          </Alert>
        </Center>
      )}
    </Center>
  )
}
