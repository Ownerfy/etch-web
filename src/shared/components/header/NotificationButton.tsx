import UnseenNotificationsBadge from "./UnseenNotificationsBadge"
import Show from "@/shared/components/Show.tsx"
import {useLocalState} from "irisdb-hooks"
import {NavLink} from "react-router-dom"
import Icon from "../Icons/Icon"

export default function NotificationButton() {
  const [myPubKey] = useLocalState("user/publicKey", "", String)

  return (
    <>
      <Show when={!!myPubKey}>
        <NavLink
          to={`/notifications`}
          className={({isActive}) =>
            `btn btn-ghost btn-circle -ml-2 ${isActive ? "active" : ""}`
          }
        >
          {({isActive}) => (
            <span className="indicator">
              <UnseenNotificationsBadge />
              <Icon name={isActive ? "bell-solid" : "bell-outline"} className="w-5 h-5" />
            </span>
          )}
        </NavLink>
      </Show>
    </>
  )
}
