import {useLocalState, usePublicState} from "irisdb-hooks"
import {useMemo} from "react"

import RepoCard from "@/shared/components/event/RepoCard.tsx"
import {useNavigate} from "react-router-dom"
import {Book} from "@mui/icons-material"

interface CodeTabProps {
  pubKey: string
}

interface RepoDetails {
  description: string
}

function CodeTab({pubKey}: CodeTabProps) {
  const navigate = useNavigate()

  const [myPubKey] = useLocalState("user/publicKey", "")

  const authors = useMemo(() => (pubKey ? [pubKey] : []), [pubKey])
  const [repos] = usePublicState<RepoDetails[]>(
    authors,
    "apps/git/repos",
    [],
    undefined,
    2
  )

  const handleNewRepositoryClick = () => {
    if (myPubKey) navigate("/repo/new")
  }

  return (
    <div className="flex px-4 flex-1 flex-col gap-4">
      <button className="btn btn-primary" onClick={handleNewRepositoryClick}>
        <Book /> New repository
      </button>
      {Object.entries(repos).map(([id, details]) => (
        <RepoCard key={id} repo={id} description={details.description} />
      ))}
    </div>
  )
}

export default CodeTab
