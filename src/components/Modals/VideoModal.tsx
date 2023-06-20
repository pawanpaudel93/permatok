import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay
} from '@chakra-ui/react'

interface VideoModalProps {
  videoUrl: string
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

const VideoModal = ({ videoUrl, isOpen, onOpen, onClose }: VideoModalProps) => {
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>TikTok Player</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <video
              src={videoUrl}
              width="100%"
              height="100%"
              controls
              autoPlay
            />
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default VideoModal
