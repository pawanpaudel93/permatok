'use client'

import {
  FormControl,
  Button,
  Input,
  Box,
  HStack,
  Center,
  VStack,
  Link,
  Alert,
  AlertIcon,
  Spinner,
  Text,
  SimpleGrid,
  Stack
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
      <Center mt="70px">
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
                              {formatDuration(
                                archive.video?.duration as number
                              )}
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
        {archives.length === 0 && url !== '' && searchClicked && isLoading && (
          <VStack mt={4}>
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
          <Center mt={4}>
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
