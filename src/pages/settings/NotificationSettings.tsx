import {showNotification, subscribeToNotifications} from "@/utils/notifications"
import {useEffect, useState, ChangeEvent} from "react"
import Icon from "@/shared/components/Icons/Icon"
import {useLocalState} from "irisdb-hooks"
import SnortApi from "@/utils/SnortApi"

interface StatusIndicatorProps {
  status: boolean
  enabledMessage: string
  disabledMessage: string
}

const StatusIndicator = ({
  status,
  enabledMessage,
  disabledMessage,
}: StatusIndicatorProps) => {
  return status ? (
    <div className="flex items-center">
      <Icon name="check" size={20} className="text-success mr-2" />
      {enabledMessage}
    </div>
  ) : (
    <div className="flex items-center">
      <Icon name="close" size={20} className="text-error mr-2" />
      {disabledMessage}
    </div>
  )
}

const NotificationSettings = () => {
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false)
  const hasNotificationsApi = "Notification" in window
  const [notificationsAllowed, setNotificationsAllowed] = useState(
    hasNotificationsApi && Notification.permission === "granted"
  )
  const [subscribedToPush, setSubscribedToPush] = useState(false)
  const allGood =
    /*!login.readonly &&*/ hasNotificationsApi &&
    notificationsAllowed &&
    serviceWorkerReady

  const [notificationServer, setNotificationServer] = useLocalState(
    "notifications/server",
    CONFIG.defaultSettings.notificationServer,
    String
  )
  const [isValidUrl, setIsValidUrl] = useState(true)
  const [subscriptionsData, setSubscriptionsData] = useState<string | null>(null)

  const trySubscribePush = async () => {
    try {
      if (allGood && !subscribedToPush) {
        await subscribeToNotifications()
        setSubscribedToPush(true)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    trySubscribePush()
  }, [allGood])

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          setServiceWorkerReady(true)
        }
      })
    }
  }, [])

  const requestNotificationPermission = () => {
    // Notification.requestPermission().then((permission) => { // TODO: re-enable notifications later
    //   const allowed = permission === "granted"
    //   setNotificationsAllowed(allowed)
    //   if (!allowed) {
    //     alert("Please allow notifications in your browser settings and try again.")
    //   }
    // })
  }

  const fireTestNotification = () => {
    if (notificationsAllowed) {
      const title = "Test notification"
      const options = {
        body: "Seems like it's working!",
        icon: "/favicon.png",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Orange_tabby_cat_sitting_on_fallen_leaves-Hisashi-01A.jpg/1920px-Orange_tabby_cat_sitting_on_fallen_leaves-Hisashi-01A.jpg",
      }
      showNotification(title, options, true)
    } else {
      alert("Notifications are not allowed. Please enable them first.")
    }
  }

  function handleServerChange(e: ChangeEvent<HTMLInputElement>) {
    const url = e.target.value
    const valid = validateUrl(url)
    setIsValidUrl(valid)
    if (valid) {
      setNotificationServer(url)
    }
  }

  function validateUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch (_) {
      return false
    }
  }

  useEffect(() => {
    const fetchSubscriptionsData = async () => {
      try {
        const api = new SnortApi()
        const data = await api.getSubscriptions()
        setSubscriptionsData(JSON.stringify(data, null, 2)) // Pretty print with 2 spaces
      } catch (error) {
        console.error("Failed to fetch subscriptions:", error)
      }
    }

    fetchSubscriptionsData()
  }, [])

  return (
    <div className="flex flex-col">
      <div className="flex flex-col space-y-4">
        {/*
            <StatusIndicator
            status={!login.readonly}
            enabledMessage="You have write access"
            disabledMessage="You don't have write access"
            />
        */}
        <StatusIndicator
          status={hasNotificationsApi}
          enabledMessage="Notifications API is enabled"
          disabledMessage="Notifications API is disabled"
        />
        <div className="flex items-center gap-2">
          <StatusIndicator
            status={notificationsAllowed}
            enabledMessage="Notifications are allowed"
            disabledMessage="Notifications are not allowed"
          />
          {hasNotificationsApi && !notificationsAllowed && (
            <button className="btn btn-neutral" onClick={requestNotificationPermission}>
              Allow
            </button>
          )}
          {notificationsAllowed && (
            <button className="btn btn-neutral btn-sm" onClick={fireTestNotification}>
              Test Notification
            </button>
          )}
        </div>
        <StatusIndicator
          status={serviceWorkerReady}
          enabledMessage="Service Worker is running"
          disabledMessage="Service Worker is not running"
        />
        <div className="flex items-center gap-2">
          <StatusIndicator
            status={subscribedToPush}
            enabledMessage="Subscribed to push notifications"
            disabledMessage="Not subscribed to push notifications"
          />
          {allGood && !subscribedToPush && (
            <button className="btn btn-primary btn-sm" onClick={subscribeToNotifications}>
              Subscribe
            </button>
          )}
        </div>
        <div>
          <b>Notification Server</b>
          <div className="mt-2">
            <input
              type="text"
              className={`w-96 max-w-full input input-primary ${isValidUrl ? "" : "input-error"}`}
              value={notificationServer}
              onChange={handleServerChange}
            />
            {!isValidUrl && <p className="text-error">Invalid URL</p>}
          </div>
          <div className="mt-2">
            Self-host notification server?{" "}
            <a
              className="link"
              href="https://github.com/mmalmi/nostr-notification-server"
            >
              Source code
            </a>
          </div>
        </div>
        <div className="mt-4">
          <b>Debug: /subscriptions Response</b>
          <pre className="bg-base-200 p-4 rounded overflow-auto whitespace-pre-wrap break-all">
            {subscriptionsData || "Loading..."}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default NotificationSettings
