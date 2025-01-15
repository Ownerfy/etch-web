import FeedItem from "@/shared/components/event/FeedItem/FeedItem.tsx"
import Embed, {allEmbeds} from "../index.ts"
import {nip19} from "nostr-tools"

export const eventRegex =
  /(?:^|nostr:|(?:https?:\/\/[\w./]+)|iris\.to\/|snort\.social\/e\/|damus\.io\/)((?:@)?note[a-zA-Z0-9]{59,60})(?![\w/])/gi

const NostrNote: Embed = {
  regex: eventRegex,
  component: ({match}) => {
    try {
      const hex = nip19.decode(match.replace("@", ""))
      if (!hex) throw new Error(`Invalid hex: ${match}`)
      return (
        <FeedItem
          eventId={hex.data as string}
          key={hex.data as string}
          showActions={false}
          showRepliedTo={false}
          asEmbed={true}
        />
      )
    } catch (error) {
      return match
    }
  },
}

// need to add this to allEmbeds here to prevent runtime circular dependency
allEmbeds.unshift(NostrNote)

export default NostrNote
