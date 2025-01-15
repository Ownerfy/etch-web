import {UserRow} from "@/shared/components/user/UserRow.tsx"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import {Bolt} from "@mui/icons-material"

interface RezapHeaderProps {
  event: NDKEvent
}

function RezapHeader({event}: RezapHeaderProps) {
  return (
    <span className="flex items-center font-bold">
      <UserRow pubKey={event.pubkey} avatarWidth={38} />
      <span className="mr-1 -ml-1">rezapped</span>
      <Bolt className="text-custom-accent" />
    </span>
  )
}

export default RezapHeader
