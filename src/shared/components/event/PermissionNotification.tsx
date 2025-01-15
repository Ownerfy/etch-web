import {NDKEvent} from "@nostr-dev-kit/ndk"
import RepoCard from "./RepoCard"

interface PermissionNotificationProps {
  event: NDKEvent
}

function PermissionNotification({event}: PermissionNotificationProps) {
  const repo = event.tagValue("r")

  return (
    <div className="flex flex-col gap-2">
      <p>
        <b>Gave you write-access to a repository</b>
      </p>
      {repo && <RepoCard repo={repo} />}
    </div>
  )
}

export default PermissionNotification
