import {Name} from "@/shared/components/user/Name.tsx"
import {Link} from "react-router-dom"
import Embed from "../index.ts"

const pubKeyRegex =
  /(?:nostr:|(?:https?:\/\/[\w./]+)|iris\.to\/|snort\.social\/p\/|damus\.io\/)+((?:@)?npub[a-zA-Z0-9]{59,60})(?![\w/])/gi

const NostrNpub: Embed = {
  regex: pubKeyRegex,
  component: ({match}) => {
    const pub = match.replace("@", "")
    return (
      <Link to={`/${pub}`} className="link link-info">
        <Name pubKey={pub} className="inline" />
      </Link>
    )
  },
}

export default NostrNpub
