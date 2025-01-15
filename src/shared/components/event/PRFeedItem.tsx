import {GitPullRequestIcon} from "@primer/octicons-react"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import {useEffect, useState} from "react"
import {Link} from "react-router-dom"
import RepoCard from "./RepoCard.tsx"

type PRFeedItemProps = {
  event: NDKEvent
}

function PRFeedItem({event}: PRFeedItemProps) {
  const [repo, setRepo] = useState<string>()
  const [pullRequestId, setPullRequestId] = useState<string>()
  const [title, setTitle] = useState<string>()

  useEffect(() => {
    const dTag = event.tagValue("d")
    setRepo(dTag?.split("/")[4])
    setPullRequestId(dTag?.split("/")[6])
    setTitle(event.content)
  }, [event])

  return (
    <section className="mb-4 p-4 bg-base-100 rounded-lg shadow">
      <Link
        className="flex items-center gap-2 cursor-pointer"
        to={`/repo/${repo}/pull-requests/${pullRequestId}`}
      >
        <GitPullRequestIcon className="h-6 w-6" />
        <div>
          <span className="text-base-content">Created a new pull request </span>
          {title && <span className="font-bold">{title}</span>}
        </div>
      </Link>
      {repo && <RepoCard repo={repo} />}
    </section>
  )
}

export default PRFeedItem
