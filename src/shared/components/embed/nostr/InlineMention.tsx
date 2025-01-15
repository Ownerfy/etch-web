// mentions like #[3], can refer to event or user

import {Link} from "react-router-dom"
import {nip19} from "nostr-tools"

import {Name} from "@/shared/components/user/Name.tsx"

import FeedItem from "@/shared/components/event/FeedItem/FeedItem.tsx"
import Embed from "../index.ts"

const fail = (s: string) => `#[${s}]`

const InlineMention: Embed = {
  regex: /#\[([0-9]+)]/g,
  component: ({match, index, event}) => {
    if (!event?.tags) {
      console.warn("no tags", event)
      return <>{fail(match)}</>
    }
    const tag = event.tags[parseInt(match)]
    if (!tag) {
      console.warn("no matching tag", index, event)
      return <>{fail(match)}</>
    }
    const [type, id] = tag
    if (type === "p") {
      return (
        <Link to={`/${nip19.npubEncode(id)}`} className="link">
          <Name pubKey={id} />
        </Link>
      )
    } else if (type === "e") {
      return (
        <FeedItem
          asEmbed={true}
          eventId={id}
          key={id}
          showActions={false}
          showRepliedTo={false}
        />
      )
    } else {
      console.warn("unknown tag type in InlineMention", type, index, event)
      return <>{fail(match)}</>
    }
  },
}

export default InlineMention
