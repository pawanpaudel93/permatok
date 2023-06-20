import { TiktokType, formatDate, formatDuration } from '@/lib/utils'
import {
  SimpleGrid,
  VStack,
  Stack,
  Button,
  Box,
  Link,
  Text,
  useDisclosure
} from '@chakra-ui/react'
import { useState } from 'react'
import VideoModal from '../Modals/VideoModal'

interface TiktoksProps {
  tiktoks: TiktokType[]
}

const Tiktoks = ({ tiktoks }: TiktoksProps) => {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const [videoUrl, setVideoUrl] = useState('')

  return (
    <>
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
              <Button
                onClick={() => {
                  setVideoUrl(tiktok.archivedUrl)
                  onOpen()
                }}
                colorScheme="blue"
                variant="outline"
                size="sm"
              >
                Watch TikTok
              </Button>
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
                    <Text>{formatDate(tiktok.video?.created as number)}</Text>
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
      <VideoModal
        videoUrl={videoUrl}
        onClose={onClose}
        onOpen={onOpen}
        isOpen={isOpen}
      />
    </>
  )
}

export default Tiktoks
