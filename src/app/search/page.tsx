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
  Image,
  Alert,
  AlertIcon,
  Spinner,
  Text,
  Stack
} from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { SearchIcon } from '@chakra-ui/icons'
import { FormEvent, useState } from 'react'
import {
  getErrorMessage,
  formatDate,
  ArchiveType,
  searchArchives
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
                  placeholder="Search URL"
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
        )}
        {archives.length === 0 && url !== '' && searchClicked && isLoading && (
          <VStack mt="20px">
            <Text>Searching archives...</Text>
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
          <Center mt={20}>
            <Alert status="info">
              <AlertIcon />
              No archives found
            </Alert>
          </Center>
        )}
      </Center>
    </div>
  )
}
