'use client'

import {
  FormControl,
  Button,
  Input,
  Box,
  HStack,
  Center,
  VStack,
  Alert,
  AlertIcon,
  Spinner,
  Text
} from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { SearchIcon } from '@chakra-ui/icons'
import { FormEvent, useState } from 'react'
import { getErrorMessage, TiktokType, searchTiktoks } from '@/lib/utils'
import Tiktoks from '@/components/Tiktok/Tiktoks'

export default function Search() {
  const [cursor, setCursor] = useState('')
  const [tiktoks, setTiktoks] = useState<TiktokType[]>([])
  const [hasNextPage, setHasNextPage] = useState(true)
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [searchClicked, setSearchClicked] = useState(false)

  async function fetchData() {
    setIsLoading(true)
    try {
      const response = await searchTiktoks(
        url.replace(/\/$/, ''),
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
                    setTiktoks([])
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
              <Tiktoks tiktoks={tiktoks} />
            </InfiniteScroll>
          </Box>
        )}
        {tiktoks.length === 0 && url !== '' && searchClicked && isLoading && (
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
        {tiktoks.length === 0 && url !== '' && searchClicked && !isLoading && (
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
