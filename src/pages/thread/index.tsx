import FeedItem from "@/shared/components/event/FeedItem/FeedItem"
import MiddleHeader from "@/shared/components/header/MiddleHeader"
import RightColumn from "@/shared/components/RightColumn.tsx"
import Trending from "@/shared/components/feed/Trending.tsx"
import FollowList from "@/pages/user/components/FollowList"
import Widget from "@/shared/components/ui/Widget"
import socialGraph from "@/utils/socialGraph"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import {useLocalState} from "irisdb-hooks"
import {getTags} from "@/utils/nostr"
import {useState} from "react"

export default function ThreadPage({id}: {id: string}) {
  const [relevantPeople, setRelevantPeople] = useState(new Map<string, boolean>())
  const [hideEventsByUnknownUsers] = useLocalState(
    "settings/hideEventsByUnknownUsers",
    true,
    Boolean
  )

  const addRelevantPerson = (person: string) => {
    setRelevantPeople((prev) => new Map(prev).set(person, true))
  }

  const addToThread = (event: NDKEvent) => {
    if (hideEventsByUnknownUsers && socialGraph().getFollowDistance(event.pubkey) > 5)
      return
    addRelevantPerson(event.pubkey)
    for (const user of getTags("p", event.tags)) {
      addRelevantPerson(user)
    }
  }

  return (
    <div className="flex justify-center">
      <div className="flex-1">
        <MiddleHeader title="Thread" />
        <FeedItem
          key={id}
          eventId={id}
          standalone={true}
          onEvent={addToThread}
          showReplies={Infinity}
        />
      </div>
      <RightColumn>
        {() => (
          <>
            {relevantPeople.size > 0 && (
              <Widget title="Relevant people">
                <FollowList
                  follows={Array.from(relevantPeople.keys())}
                  showAbout={true}
                />
              </Widget>
            )}
            <Widget title="Trending posts">
              <Trending />
            </Widget>
          </>
        )}
      </RightColumn>
    </div>
  )
}
