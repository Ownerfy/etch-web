import {useLocalState} from "irisdb-hooks"
import {useState, useMemo} from "react"

import useFollows from "@/shared/hooks/useFollows.ts"
import FollowsList from "./FollowList.tsx"
import {statCalc} from "@/utils/utils.ts"

import Icon from "@/shared/components/Icons/Icon.tsx"
import Modal from "@/shared/components/ui/Modal"

import socialGraph from "@/utils/socialGraph"

interface FollowsCountProps {
  pubKey: string
}

function FollowsCount({pubKey}: FollowsCountProps) {
  const f = useFollows(pubKey) // to query from relays and trigger update
  const follows = useMemo(
    () => Array.from(socialGraph().getFollowedByUser(pubKey)),
    [pubKey, f]
  )
  const [myPubKey] = useLocalState("user/publicKey", "")
  const [showFollowsList, setShowFollowsList] = useState<boolean>(false)

  const handleFollowsClick = () => {
    setShowFollowsList(!showFollowsList)
  }

  return (
    <>
      <button className="btn btn-sm btn-neutral" onClick={handleFollowsClick}>
        <Icon name="stars" /> <span>Follows </span>{" "}
        <span className="badge">{statCalc(follows.length)}</span>
      </button>
      {follows?.includes(myPubKey) && (
        <span className="badge badge-neutral">Follows you</span>
      )}
      {showFollowsList && (
        <Modal onClose={() => setShowFollowsList(false)}>
          <div className=" w-[400px] max-w-full">
            <h3 className="text-xl font-semibold mb-4">Follows</h3>
          </div>
          <div className="overflow-y-auto max-h-[50vh]">
            <FollowsList follows={follows} />
          </div>
        </Modal>
      )}
    </>
  )
}

export default FollowsCount
