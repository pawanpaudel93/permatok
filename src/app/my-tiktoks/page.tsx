'use client'

import {
  Box,
  Center,
  VStack,
  Alert,
  AlertIcon,
  Spinner,
  Text
} from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { usePersistStore } from '@/lib/store'
import { useEffect, useState } from 'react'
import { getTiktoks, TiktokType, getErrorMessage } from '@/lib/utils'
import Tiktoks from '@/components/Tiktok/Tiktoks'

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
            <Tiktoks tiktoks={tiktoks} />
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
