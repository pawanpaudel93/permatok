'use client'

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Button,
  Input,
  Container,
  Center,
  Progress,
  Box,
  Link,
  VStack,
  Table,
  TableContainer,
  Tbody,
  Text,
  Td,
  Tr,
  HStack,
  IconButton,
  useToast,
  useDisclosure
} from '@chakra-ui/react'
import isURL from 'validator/lib/isURL'
import { Formik, Form, Field, FormikValues, FormikState } from 'formik'
import { ModalLocation, OthentLogin } from '@/components/othent'
import { useState } from 'react'
import { prepareFile, uploadToBundlr } from '@/lib/archive'
import {
  TiktokType,
  formatDate,
  formatDuration,
  getAccessToken,
  getTiktok,
  getErrorMessage
} from '@/lib/utils'
import { usePersistStore } from '@/lib/store'
import { CloseIcon } from '@chakra-ui/icons'
import { Video, extractVideoId } from '@/lib/tiktok'
import VideoModal from '@/components/Modals/VideoModal'

interface MyFormValues {
  url: string
}

const Save = () => {
  const defaultTiktok = {
    id: '',
    url: '',
    archivedUrl: '',
    timestamp: 0,
    video: undefined
  }
  const { userData } = usePersistStore()
  const toast = useToast()
  const initialValues: MyFormValues = { url: '' }
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated } = usePersistStore()
  const [tiktok, setTiktok] = useState<TiktokType>(defaultTiktok)
  const { isOpen, onClose, onOpen } = useDisclosure()
  const [videoUrl, setVideoUrl] = useState('')

  function validateURL(value: string) {
    return isURL(value) && extractVideoId(value)
      ? undefined
      : 'Invalid TikTok URL'
  }

  async function saveUrl(url: string) {
    try {
      setTiktok(defaultTiktok)
      const savedTiktok = await getTiktok(url)
      if (savedTiktok.archivedUrl) {
        setTiktok(savedTiktok)
      } else {
        const accessToken = await getAccessToken()
        const address = userData?.contract_id as string
        const response = await fetch('/api/video-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url })
        })
        const responseJSON = await response.json()
        const videoData = responseJSON.data as Video

        const timestamp = Math.floor(Date.now() / 1000)

        const { data, tags } = await prepareFile(
          videoData,
          url,
          timestamp,
          address
        )
        const transactionId = await uploadToBundlr(
          data,
          tags,
          accessToken.id_token
        )

        setTiktok({
          id: transactionId,
          timestamp,
          video: videoData,
          url,
          archivedUrl: `https://arweave.net/${transactionId}`
        })
      }
    } catch (error) {
      console.trace(error)
      toast({
        title: getErrorMessage(error),
        status: 'error',
        position: 'top-right',
        isClosable: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (
    values: FormikValues,
    actions: {
      setSubmitting: (isSubmitting: boolean) => void
    }
  ) => {
    setIsLoading(true)
    const { url } = values
    try {
      await saveUrl(url)
    } catch (e) {
      console.log(getErrorMessage(e))
    } finally {
      setIsLoading(false)
      actions.setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '60vh',
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Container>
        <Box
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="lg"
          overflow="hidden"
          p={6}
        >
          <Formik initialValues={initialValues} onSubmit={handleSubmit}>
            {(props: { isSubmitting: any }) => (
              <Form>
                <Field name="url" validate={validateURL}>
                  {({
                    field,
                    form
                  }: {
                    field: { name: string; value: string }
                    form: FormikState<MyFormValues>
                  }) => (
                    <FormControl
                      isInvalid={!!form.errors.url && !!form.touched.url}
                    >
                      <FormLabel>Save TikTok video</FormLabel>
                      <Input {...field} placeholder="TikTok video URL" />
                      <FormErrorMessage>{form.errors.url}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                {isLoading && (
                  <Progress size="xs" isIndeterminate hasStripe isAnimated />
                )}
                <Center>
                  {isAuthenticated ? (
                    <Button
                      mt={4}
                      colorScheme="blue"
                      isLoading={props.isSubmitting || isLoading}
                      loadingText="Saving..."
                      type="submit"
                      isDisabled={!isAuthenticated}
                    >
                      Save
                    </Button>
                  ) : (
                    <div
                      style={{
                        marginTop: '15px'
                      }}
                    >
                      <OthentLogin
                        apiid={process.env.NEXT_PUBLIC_OTHENT_API_ID as string}
                        location={ModalLocation['bottom-left']}
                      />
                    </div>
                  )}
                </Center>
              </Form>
            )}
          </Formik>
        </Box>
      </Container>
      {!isLoading && tiktok.id && (
        <Container maxW="5xl">
          <VStack mt="30px">
            <HStack>
              <Text color="green" fontWeight="bold">
                Saved Result
              </Text>
              <IconButton
                colorScheme="red"
                aria-label="Clear Result"
                size="sm"
                icon={<CloseIcon />}
                onClick={() => setTiktok(defaultTiktok)}
              />
            </HStack>
            <TableContainer width="100%">
              <Table variant="striped">
                <Tbody>
                  <Tr>
                    <Td>Url</Td>
                    <Td>
                      <Link href={tiktok.url} color="blue" isExternal>
                        {tiktok.url}
                      </Link>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Username</Td>
                    <Td>
                      <Link
                        href={`https://tiktok.com/@${tiktok.video?.username}`}
                        color="blue"
                        isExternal
                      >
                        @{tiktok.video?.username}
                      </Link>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Description</Td>
                    <Td>{tiktok.video?.description}</Td>
                  </Tr>
                  <Tr>
                    <Td>Duration</Td>
                    <Td>{formatDuration(tiktok.video?.duration as number)}</Td>
                  </Tr>
                  <Tr>
                    <Td>Created At</Td>
                    <Td>{formatDate(tiktok.video?.created as number)}</Td>
                  </Tr>
                  <Tr>
                    <Td>Saved Url</Td>
                    <Td>
                      <Link href={tiktok.archivedUrl} color="blue" isExternal>
                        {tiktok.archivedUrl}
                      </Link>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Saved At</Td>
                    <Td>{formatDate(tiktok.timestamp)}</Td>
                  </Tr>
                  <Tr>
                    <Td>Watch</Td>
                    <Td>
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
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </VStack>
        </Container>
      )}
      <VideoModal
        videoUrl={videoUrl}
        onClose={onClose}
        onOpen={onOpen}
        isOpen={isOpen}
      />
    </div>
  )
}

export default Save
