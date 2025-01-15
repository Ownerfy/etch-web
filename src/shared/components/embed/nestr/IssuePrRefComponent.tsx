import {GitPullRequestIcon, IssueOpenedIcon} from "@primer/octicons-react"
import {getIssuesPRsDB} from "@/cache/issuePRRefdb"
import {Link, useNavigate} from "react-router-dom"
import {IssuePRCacheItem} from "@/types/Repo"
import {UserRow} from "../../user/UserRow"
import HoverCard from "../../ui/Hovercard"
import {useState} from "react"

interface IssuePRRefComponentProps {
  match: string
}

function IssuePRRefComponent({match}: IssuePRRefComponentProps) {
  const navigate = useNavigate()

  const [hoverCardTitle, setHoverCardTitle] = useState("")

  const matchParts = match.split(":")
  const uuid = matchParts[0]

  const matches = uuid.match(
    /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/
  )

  if (matches) {
    const type = matchParts[1] === "i" ? "issues" : "pull-requests"
    const author = matchParts[2]
    const repo = matchParts[3]

    const uuidPart = uuid.slice(0, 5)
    const tag = `#${uuidPart}`

    const handleHoverCardClick = () =>
      navigate(`/repo/${repo}/${type}/${uuid}?pubKey=${author}`)

    getIssuesPRsDB().then((db) => {
      if (db) {
        db.table("issuesPRs")
          .where("id")
          .equals(uuid)
          .toArray()
          .then((items) => {
            const item: IssuePRCacheItem = items[0]
            const title = item.title
            if (title) setHoverCardTitle(title)
          })
      }
    })

    return (
      <HoverCard
        onClick={handleHoverCardClick}
        content={
          <div className="flex flex-col gap-2 w-[25em] p-3 bg-base-100 rounded-lg cursor-pointer">
            <UserRow pubKey={author} linkToProfile={false} avatarWidth={35} />
            <div className="flex gap-2 items-center">
              {type === "issues" && <IssueOpenedIcon size={24} />}
              {type === "pull-requests" && <GitPullRequestIcon size={24} />}
              {hoverCardTitle ? (
                <p>{hoverCardTitle}</p>
              ) : (
                <div className="animate-pulse bg-neutral h-4 w-3/4 rounded-lg" />
              )}
            </div>
            <p className="text-gray-500">#{uuid}</p>
          </div>
        }
      >
        <Link
          to={`/repo/${repo}/${type}/${uuid}?pubKey=${author}`}
          className="link text-custom-accent"
        >
          {tag}{" "}
        </Link>
      </HoverCard>
    )
  }
}

export default IssuePRRefComponent
