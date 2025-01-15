import {Dispatch, SetStateAction, useContext, useEffect, useState} from "react"
import {Hexpubkey, NDKEvent} from "@nostr-dev-kit/ndk"
import {ndk} from "irisdb-nostr"

import LoadingComponent from "@/shared/components/ux/LoadingComponent.tsx"
import {muteUser, unmuteUser} from "@/shared/services/FeedServices.tsx"
import {UserRow} from "@/shared/components/user/UserRow.tsx"
import {UserContext} from "@/context/UserContext.tsx"

import ReportReasonForm from "./ReportReasonForm.tsx"

interface MuteUserProps {
  setMuting: Dispatch<SetStateAction<boolean>>
  user: Hexpubkey
  event?: NDKEvent
  muteState: boolean
  setMutedState: Dispatch<SetStateAction<boolean>>
}

function MuteUser({user, event, setMuting, muteState}: MuteUserProps) {
  let {pubkey} = useContext(UserContext)
  if (!pubkey) pubkey = localStorage.getItem("pubkey")

  const {mutedList, setMutedList, setPublishingError} = useContext(UserContext)

  const [loadingMute, setLoadingMute] = useState<boolean>(false)
  const [muted, setMuted] = useState<boolean>(false)
  const [reported, setReported] = useState<boolean>(false)

  useEffect(() => {
    setMuted(muteState)
  }, [muteState])

  const handleClose = () => {
    setMuting(false)
  }

  const handleMuteUser = async () => {
    setLoadingMute(true)
    muteUser(ndk(), mutedList, user)
      .then((newList) => {
        setLoadingMute(false)
        localStorage.setItem("mutedIds", JSON.stringify(newList))
      })
      .catch(() => setPublishingError(false))
  }

  const handleUnmuteUser = async () => {
    try {
      setLoadingMute(true)
      await unmuteUser(ndk(), mutedList, user)

      setLoadingMute(true)

      await unmuteUser(ndk(), mutedList, user)
        .then((newList) => {
          setMutedList(newList)
          setMuted(false)
          localStorage.setItem("mutedIds", JSON.stringify(newList))
          setLoadingMute(false)
        })
        .catch(() => {
          //error message printed in muteUser
          setPublishingError(false)
        })
    } catch (error) {
      // Ignore
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold mb-4">Mute User</h1>
        {loadingMute && <LoadingComponent />}
        {!loadingMute && (
          <div>
            {muted ? (
              <div className="flex flex-col items-center">
                <div>User Muted</div>
                <button onClick={handleUnmuteUser} className="btn btn-neutral mt-2">
                  Undo?
                </button>
              </div>
            ) : (
              <>
                <div>
                  <p>Are you sure you want to mute:</p>
                  <div className="flex items-center mt-4">
                    <UserRow pubKey={user} />
                  </div>
                </div>
                <div className="flex mt-4">
                  <button onClick={handleClose} className="btn btn-neutral mr-2">
                    No
                  </button>
                  <button onClick={handleMuteUser} className="btn btn-primary">
                    Yes
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <div>
        <h2 className="text-lg font-bold mb-4">Would you like to submit a report?</h2>
        {reported ? (
          <div className="text-center">Thank you for your report!</div>
        ) : (
          <ReportReasonForm user={user} event={event} setReported={setReported} />
        )}
      </div>
    </div>
  )
}

export default MuteUser
