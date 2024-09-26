import { classroom } from '@/Types'
import { downloadCallList } from '@/utils/downloadCallList'
import { Button } from '@nextui-org/react'
import { DownloadSimple } from '@phosphor-icons/react'
import { forwardRef } from 'react'

interface DownloadButtonProps {
  classroom: classroom
}

// Usando forwardRef com um nome de função
const DownloadButton = forwardRef<HTMLButtonElement, DownloadButtonProps>(
  function DownloadButton({ classroom }, ref) {
    return (
      <Button
        ref={ref}
        isDisabled={!classroom}
        isIconOnly
        onPress={() => downloadCallList({ classroom })}
        className="bg-bunker-900 shadow shadow-black *:duration-300 *:hover:text-green-500"
      >
        <DownloadSimple size={28} className="text-white" />
      </Button>
    )
  },
)

export default DownloadButton
