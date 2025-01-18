import {NDKEvent} from "@nostr-dev-kit/ndk"
import {Adjust} from "@mui/icons-material"
import {useEffect, useState} from "react"
import {Link} from "react-router-dom"
import RepoCard from "./RepoCard.tsx"

type IssueFeedItemProps = {
  event: NDKEvent
}

function IssueFeedItem({event}: IssueFeedItemProps) {
  const [repo, setRepo] = useState<string>()
  const [issueId, setIssueId] = useState<string>()
  const [title, setTitle] = useState<string>()

  useEffect(() => {
    const dTag = event.tagValue("d")
    setRepo(dTag?.split("/")[4])
    setIssueId(dTag?.split("/")[6])
    setTitle(event.content)
  }, [event])

  return (
    <section className="IssueFeedItem mb-4 p-4 bg-base-100 rounded-lg shadow">
      <Link
        className="flex items-center gap-2 cursor-pointer"
        to={`/repo/${repo}/issues/${issueId}`}
      >
        <Adjust className="h-6 w-6" />
        <div>
          <span className="text-base-content">Created a new issue </span>
          {title && <span className="font-bold">{title}</span>}
        </div>
      </Link>
      {repo && <RepoCard repo={repo} />}
    </section>
  )
}

export default IssueFeedItem
