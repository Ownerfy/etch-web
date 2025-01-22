import {
  defaultNotificationsFilter,
  getTag,
  getZappingUser,
  isAssignNotification,
  isGitCommentNotification,
  isIssueNotification,
  isPRNotification,
  isReviewRequestNotification,
} from "@/utils/nostr.ts"
import {
  notifications,
  Notification as IrisNotification,
  maybeShowPushNotification,
} from "@/utils/notifications"
import NotificationsFeedItem from "@/pages/notifications/NotificationsFeedItem"
import InfiniteScroll from "@/shared/components/ui/InfiniteScroll"
import useHistoryState from "@/shared/hooks/useHistoryState"
import {NDKEvent, NDKSubscription} from "@nostr-dev-kit/ndk"
import runningOstrich from "@/assets/running-ostrich.gif"
import {useEffect, useCallback, useState} from "react"
import {SortedMap} from "@/utils/SortedMap/SortedMap"
import socialGraph from "@/utils/socialGraph"
import {useLocalState} from "irisdb-hooks"
import {localState} from "irisdb"
import {ndk} from "irisdb-nostr"

const INITIAL_DISPLAY_COUNT = 10
const DISPLAY_INCREMENT = 10

let sub: NDKSubscription | undefined

localState.get("user/publicKey").on((myPubKey) => {
  notifications.clear()
  if (!myPubKey || typeof myPubKey !== "string") return

  sub?.stop()

  const kinds: number[] = defaultNotificationsFilter
    .filter((kind) => /^\d+$/.test(String(kind)))
    .map(Number)

  const filters = {
    kinds: kinds,
    ["#p"]: [myPubKey],
    limit: 100,
  }

  sub = ndk().subscribe(filters)

  let latest = 0

  let hideEventsByUnknownUsers = true
  localState
    .get("settings/hideEventsByUnknownUsers")
    .on((v) => (hideEventsByUnknownUsers = v as boolean))

  sub.on("event", (event: NDKEvent) => {
    if (event.kind !== 9735) {
      // allow zap notifs from self & unknown users
      if (event.pubkey === myPubKey) return
      if (hideEventsByUnknownUsers && socialGraph().getFollowDistance(event.pubkey) > 5)
        return
    }
    const eTag = getTag("e", event.tags)
    const id6927 = event.kind === 6927 ? event.id : ""
    if ((eTag && event.created_at) || (id6927 && event.created_at)) {
      const key = `${id6927 ? id6927 : eTag}-${event.kind}`

      const notification =
        notifications.get(key) ||
        ({
          id: event.id,
          originalEventId: eTag || id6927,
          users: new SortedMap([], "time"),
          kind: event.kind,
          time: event.created_at,
          content: event.content,
          tags: event.tags,
        } as IrisNotification)
      const user = event.kind === 9735 ? getZappingUser(event) : event.pubkey
      if (!user) {
        console.warn("no user for event", event)
        return
      }
      const existing = notification.users.get(user)
      if (!existing || existing.time < event.created_at) {
        notification.users.set(user, {time: event.created_at})
      }
      if (event.created_at > notification.time) {
        notification.time = event.created_at
      }

      notifications.set(key, notification)
      maybeShowPushNotification(event)

      const created_at = event.created_at * 1000

      if (created_at > latest) {
        latest = created_at
        localState.get("notifications/latest").put(latest)
      }
    }
  })
})

let notificationsSeenAt = 0
localState.get("notifications/seenAt").on((v) => (notificationsSeenAt = v as number))

function NotificationsFeed() {
  const [displayCount, setDisplayCount] = useHistoryState(
    INITIAL_DISPLAY_COUNT,
    "displayCount"
  )

  const [latestNotificationTime] = useLocalState("notifications/latest", 0, Number)

  const [initialNotificationsSeenAt, setInitialNotificationsSeenAt] =
    useState(notificationsSeenAt)
  useEffect(() => {
    if (initialNotificationsSeenAt === 0) {
      setInitialNotificationsSeenAt(notificationsSeenAt)
    }
  }, [notificationsSeenAt])
  console.log("initialNotificationsSeenAt", initialNotificationsSeenAt)

  const [notificationsFilter] = useLocalState(
    "user/notificationsFilter",
    defaultNotificationsFilter
  )

  const updateSeenAt = useCallback(() => {
    if (document.hasFocus() && latestNotificationTime > notificationsSeenAt) {
      setTimeout(() => {
        localState.get("notifications/seenAt").put(Date.now())
      }, 1000)
    }
  }, [latestNotificationTime, notificationsSeenAt])

  useEffect(() => {
    updateSeenAt()
  }, [latestNotificationTime, updateSeenAt])

  useEffect(() => {
    const handleUpdate = () => updateSeenAt()

    document.addEventListener("visibilitychange", handleUpdate)
    document.addEventListener("input", handleUpdate)
    document.addEventListener("mousemove", handleUpdate)
    document.addEventListener("scroll", handleUpdate)

    return () => {
      document.removeEventListener("visibilitychange", handleUpdate)
      document.removeEventListener("input", handleUpdate)
      document.removeEventListener("mousemove", handleUpdate)
      document.removeEventListener("scroll", handleUpdate)
    }
  }, [updateSeenAt])

  const displayFilterFn = useCallback(
    (notification: IrisNotification) => {
      // custom filtering
      if (!notificationsFilter.includes("issues") && isIssueNotification(notification))
        return false
      if (
        !notificationsFilter.includes("pull-requests") &&
        isPRNotification(notification)
      )
        return false
      if (
        !notificationsFilter.includes("git-comments") &&
        isGitCommentNotification(notification)
      )
        return false
      if (
        !notificationsFilter.includes("git-assigns") &&
        isAssignNotification(notification)
      )
        return false
      if (
        !notificationsFilter.includes("review-requests") &&
        isReviewRequestNotification(notification)
      )
        return false
      // exclude all possibly irrelevant kind 6927 events
      if (
        notification.kind === 6927 &&
        !isIssueNotification(notification) &&
        !isPRNotification(notification) &&
        !isGitCommentNotification(notification) &&
        !isAssignNotification(notification) &&
        !isReviewRequestNotification(notification)
      )
        return false
      // default filtering
      if (!notificationsFilter.includes(notification.kind)) {
        return false
      }
      return true
    },
    [notificationsFilter]
  )

  useEffect(() => {
    // Check and request notification permission
    if (
      window.Notification &&
      window.Notification.permission !== "granted" &&
      window.Notification.permission !== "denied"
    ) {
      // window.Notification.requestPermission() TODO: re-enable notifications later
    }

    // ... existing effect logic ...
  }, []) // Empty dependency array for initialization

  return (
    <div className="w-full overflow-hidden">
      <InfiniteScroll
        onLoadMore={() => {
          if (notifications.size > displayCount) {
            setDisplayCount(displayCount + DISPLAY_INCREMENT)
          }
        }}
      >
        {notifications.size > 0 ? (
          Array.from(notifications.entries())
            .filter((notification) => displayFilterFn(notification[1]))
            .reverse()
            .slice(0, displayCount)
            .map((entry) => (
              <NotificationsFeedItem
                highlight={entry[1].time > initialNotificationsSeenAt}
                key={entry[0]}
                notification={entry[1]}
              />
            ))
        ) : (
          <div className="p-8 flex flex-col gap-8 items-center justify-center text-base-content/50">
            No notifications yet
            <img src={runningOstrich} alt="" className="w-24" />
          </div>
        )}
      </InfiniteScroll>
    </div>
  )
}

export default NotificationsFeed
