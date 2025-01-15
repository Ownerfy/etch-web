import {useMemo, useState} from "react"

import socialGraph from "@/utils/socialGraph.ts"
import {statCalc} from "@/utils/utils.ts"

import Modal from "@/shared/components/ui/Modal.tsx"

import Icon from "@/shared/components/Icons/Icon.tsx"
import FollowList from "./FollowList.tsx"

const FollowerCount = ({pubKey}: {pubKey: string}) => {
  const followers = useMemo(
    () => Array.from(socialGraph().getFollowersByUser(pubKey)),
    [pubKey]
  )
  const [showFollowList, setShowFollowList] = useState<boolean>(false)

  const handleFollowersClick = () => {
    setShowFollowList(!showFollowList)
  }

  return (
    <>
      <button className="btn btn-sm btn-neutral" onClick={handleFollowersClick}>
        <Icon name="user-v2" /> <span>Known followers</span>{" "}
        <span className="badge">{statCalc(followers.length)}</span>
      </button>
      {showFollowList && (
        <Modal onClose={() => setShowFollowList(false)}>
          <div className=" w-[400px] max-w-full">
            <h3 className="text-xl font-semibold mb-4">Known followers</h3>
            <div className="overflow-y-auto max-h-[50vh]">
              <FollowList follows={followers} />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export default FollowerCount
