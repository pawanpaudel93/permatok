'use client'

import {
  FormControl,
  Button,
  Input,
  Box,
  HStack,
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
  Text
} from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { SearchIcon } from '@chakra-ui/icons'
import { FormEvent, useState } from 'react'
import {
  getErrorMessage,
  formatDate,
  ArchiveType,
  searchArchives,
  formatDuration
} from '@/lib/utils'

export default function Search() {
  const [cursor, setCursor] = useState('')
  const [archives, setArchives] = useState<ArchiveType[]>([])
  const [hasNextPage, setHasNextPage] = useState(true)
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [searchClicked, setSearchClicked] = useState(false)

  async function fetchData() {
    setIsLoading(true)
    try {
      const response = await searchArchives(
        url.replace(/\/$/, ''),
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

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSearchClicked(true)
    await fetchData()
  }

  return (
    <div>
      <Center>
        <Box
          position="fixed"
          top="80px"
          borderWidth="1px"
          boxShadow="lg"
          borderRadius="lg"
          overflow="hidden"
          width={{
            base: '100%',
            lg: '50%'
          }}
          p={3}
          zIndex={1}
        >
          <form onSubmit={onSubmit}>
            <HStack px={2}>
              <FormControl>
                <Input
                  placeholder="Search TikTok URL"
                  value={url}
                  onChange={(e) => {
                    setSearchClicked(false)
                    setHasNextPage(false)
                    setCursor('')
                    setArchives([])
                    setUrl(e.target.value)
                  }}
                  required
                />
              </FormControl>

              <Button
                colorScheme="blue"
                isLoading={isLoading}
                p={2}
                type="submit"
              >
                <SearchIcon />
              </Button>
            </HStack>
          </form>
        </Box>
      </Center>
      <Center mt="100px">
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
                          <Link
                            href={archive.video?.url}
                            color="blue"
                            isExternal
                          >
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
                              {formatDuration(
                                archive.video?.duration as number
                              )}
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
        )}
        {archives.length === 0 && url !== '' && searchClicked && isLoading && (
          <VStack mt={12}>
            <Text>Searching saved TikToks...</Text>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
          </VStack>
        )}
        {archives.length === 0 && url !== '' && searchClicked && !isLoading && (
          <Center mt={16}>
            <Alert status="info">
              <AlertIcon />
              No saved TikToks found
            </Alert>
          </Center>
        )}
      </Center>
    </div>
  )
}
