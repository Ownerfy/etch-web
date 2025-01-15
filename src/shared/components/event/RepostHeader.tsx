import {Name} from "@/shared/components/user/Name"
import {ChangeCircle} from "@mui/icons-material"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import {Link} from "react-router-dom"
import {nip19} from "nostr-tools"

interface RepostHeaderProps {
  event: NDKEvent
}

function RepostHeader({event}: RepostHeaderProps) {
  return (
    <Link
      to={`/${nip19.npubEncode(event.pubkey)}`}
      className="flex items-center font-bold text-sm text-base-content/50 hover:underline"
    >
      <Name pubKey={event.pubkey} />
      <span className="mx-1">reposted</span>
      <ChangeCircle />
    </Link>
  )
}

export default RepostHeader
