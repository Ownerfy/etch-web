import {useAuthors, useLocalState} from "irisdb-hooks"
import {Link, useNavigate} from "react-router-dom"
import {publicState} from "irisdb-nostr"
import {useEffect, useMemo} from "react"
import {nip19} from "nostr-tools"
import {localState} from "irisdb"

import useSearchParam from "@/shared/hooks/useSearchParam.ts"
import {UserRow} from "@/shared/components/user/UserRow.tsx"

import ExplorerNode from "./ExplorerNode"

type Props = {
  p?: string
  path?: string
}

const Explorer = ({p}: Props) => {
  const [myPubKey] = useLocalState("user/publicKey", "")
  const user = useSearchParam("user", "")
  const navigate = useNavigate()
  const authors = useAuthors(user)

  useEffect(() => {
    if (myPubKey && !user) {
      navigate(`./?user=${nip19.npubEncode(myPubKey)}`, {replace: true})
    }
  }, [myPubKey, user])

  const publicNode = useMemo(() => {
    return publicState(authors)
  }, [authors])

  return (
    <div className="flex flex-col gap-2">
      <div>{p}</div>
      <div className="mb-4">
        <ExplorerNode expanded={true} name="Local data" node={localState} />
      </div>
      {user && (
        <>
          <div className="p-4">
            {user === "follows" ? (
              "Data by followed users:"
            ) : (
              <Link to={`/${user}`}>
                <UserRow pubKey={user} />
              </Link>
            )}
          </div>
          <div className="mb-4">
            <ExplorerNode expanded={true} name="User public data" node={publicNode} />
          </div>
        </>
      )}
    </div>
  )
}

export default Explorer
