import {useLocalState} from "irisdb-hooks"

export default function UnseenNotificationsBadge() {
  const [latestNotification] = useLocalState("notifications/latest", 0, Number)
  const [notificationsSeenAt] = useLocalState("notifications/seenAt", 0, Number)

  return (
    <>
      {notificationsSeenAt < latestNotification && (
        <div className="indicator-item badge badge-primary badge-xs"></div>
      )}
    </>
  )
}
