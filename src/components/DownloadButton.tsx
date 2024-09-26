import { classroom } from '@/Types'
import { downloadCallList } from '@/utils/downloadCallList'
import { Button } from '@nextui-org/react'
import { DownloadSimple } from '@phosphor-icons/react'

interface DownloadButtonProps {
  classroom: classroom
}

export default function DownloadButton({ classroom }: DownloadButtonProps) {
  return (
    <Button
      isDisabled={!classroom}
      isIconOnly
      onPress={() => downloadCallList({ classroom })}
      className="bg-bunker-900 shadow shadow-black *:duration-300 *:hover:text-green-500"
    >
      <DownloadSimple size={28} className="text-white" />
    </Button>
  )
}
