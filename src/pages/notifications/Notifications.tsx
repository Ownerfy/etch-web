import NotificationsFeed from "@/shared/components/feed/NotificationsFeed.tsx"
import MiddleHeader from "@/shared/components/header/MiddleHeader"
import BskyTrending from "@/shared/components/feed/BskyTrending"
import {subscribeToNotifications} from "@/utils/notifications"
import RightColumn from "@/shared/components/RightColumn"
import Trending from "@/shared/components/feed/Trending"
import Widget from "@/shared/components/ui/Widget"
import {useEffect} from "react"
let subscribed = false

function Notifications() {
  useEffect(() => {
    if (subscribed) {
      return
    }
    subscribeToNotifications()
    subscribed = true
  })

  return (
    <section className="flex flex-1 relative">
      <div className="flex flex-col flex-1 gap-2">
        <MiddleHeader title="Notifications" />
        <NotificationsFeed />
      </div>
      <RightColumn>
        {() => (
          <>
            <BskyTrending />
            <Widget title="Nostr trending posts">
              <Trending />
            </Widget>
          </>
        )}
      </RightColumn>
    </section>
  )
}

export default Notifications
