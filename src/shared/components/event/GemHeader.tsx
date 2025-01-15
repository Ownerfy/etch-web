import {UserRow} from "@/shared/components/user/UserRow.tsx"
import {Diamond} from "@mui/icons-material"
import {NDKEvent} from "@nostr-dev-kit/ndk"

interface GemHeaderProps {
  event: NDKEvent
}

function GemHeader({event}: GemHeaderProps) {
  return (
    <span className="flex items-center font-bold">
      <UserRow pubKey={event.pubkey} avatarWidth={38} />
      <span className="mr-1 -ml-1">pinned a Gem</span>
      <Diamond className="w-10 h-10" />
    </span>
  )
}
export default GemHeader
