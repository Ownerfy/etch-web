import {useContext, useEffect, useMemo, useState} from "react"
import {useLocalState, usePublicState} from "irisdb-hooks"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import {nip19} from "nostr-tools"
import {ndk} from "irisdb-nostr"

import {unmuteUser} from "@/shared/services/FeedServices.tsx"
import {UserContext} from "@/context/UserContext.tsx"

import Reactions from "@/shared/components/event/reactions/Reactions.tsx"
import Dropdown from "@/shared/components/ui/Dropdown.tsx"
import Modal from "@/shared/components/ui/Modal.tsx"
import ReportUser from "../ReportUser.tsx"
import MuteUser from "../MuteUser.tsx"
import RawJSON from "../RawJSON.tsx"

type FeedItemDropdownProps = {
  event: NDKEvent
  onClose: () => void
}

function FeedItemDropdown({event, onClose}: FeedItemDropdownProps) {
  const [myPubKey] = useLocalState("user/publicKey", "")

  const [showReactions, setShowReactions] = useState(false)
  const [showRawJSON, setShowRawJSON] = useState(false)
  const [muted, setMuted] = useState(false)
  const [muting, setMuting] = useState(false)
  const [reporting, setReporting] = useState(false)

  const {setDeleting, mutedList, setMutedList, setPublishingError} =
    useContext(UserContext)

  const authors = useMemo(() => (myPubKey ? [myPubKey] : []), [myPubKey])

  const [gem, setGem] = usePublicState<string>(authors, `user/gems/${event.id}`, "")

  useEffect(() => {
    setMuted(mutedList.includes(event.pubkey))
  }, [mutedList, event])

  const handleCopyText = () => {
    navigator.clipboard.writeText(event.content)
    onClose()
  }
  const handleCopyAuthorID = () => {
    const npub = nip19.npubEncode(event.pubkey)
    navigator.clipboard.writeText(npub)
    onClose()
  }
  const handleCopyNoteID = () => {
    navigator.clipboard.writeText(event.encode())
    onClose()
  }
  const handleMute = async () => {
    if (muted) {
      await unmuteUser(ndk(), mutedList, event.pubkey)
        .then((newList) => {
          setMutedList(newList)
        })
        .catch((error) => {
          setPublishingError(true)
          console.warn("Unable to unmute user", error)
        })
    } else {
      setMuting(true)
    }
  }

  const handleShowRawJson = () => {
    setShowRawJSON(!showRawJSON)
  }

  const handleDeletionRequest = async () => {
    if (event.pubkey === myPubKey) {
      try {
        await event.delete()
        // triggers refetch for feeds
        setDeleting(event.id)
        onClose()
      } catch (error) {
        setPublishingError(true)
        console.warn("Event could not be deleted: ", error)
      }
    }
  }

  const handleCreateGem = () => {
    if (event.pubkey === myPubKey) {
      setGem(event.id)
      onClose()
    }
  }

  const handleRemoveGem = () => {
    if (gem && gem !== "gem removed") {
      setGem("gem removed")
      onClose()
    }
  }

  const handleReporting = () => {
    setReporting(true)
  }

  return (
    <div className="z-40">
      <Dropdown onClose={onClose}>
        {showReactions && (
          <div onClick={(e) => e.stopPropagation()}>
            <Modal onClose={() => setShowReactions(false)}>
              <Reactions event={event} />
            </Modal>
          </div>
        )}
        {reporting && (
          <div onClick={(e) => e.stopPropagation()}>
            <Modal onClose={() => setReporting(false)}>
              <ReportUser user={event.id} event={event} />
            </Modal>
          </div>
        )}
        {muting && (
          <div onClick={(e) => e.stopPropagation()}>
            <Modal onClose={() => setMuting(false)}>
              <MuteUser
                muteState={muted}
                user={event.pubkey}
                event={event}
                setMuting={setMuting}
                setMutedState={setMuted}
              />
            </Modal>
          </div>
        )}
        {showRawJSON && (
          <div onClick={(e) => e.stopPropagation()}>
            <Modal onClose={() => setShowRawJSON(false)}>
              <RawJSON event={event} />
            </Modal>
          </div>
        )}
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li>
            <button onClick={() => setShowReactions(!showReactions)}>
              Show reactions
            </button>
          </li>
          {event.pubkey === myPubKey && event.kind === 1 && (
            <li>
              {!gem || gem === "gem removed" ? (
                <button onClick={handleCreateGem}>Pin as Gem</button>
              ) : (
                <button onClick={handleRemoveGem}>Unpin Gem</button>
              )}
            </li>
          )}
          <li>
            <button onClick={handleCopyText}>Copy Note Content</button>
          </li>
          <li>
            <button onClick={handleShowRawJson}>Show Raw JSON</button>
          </li>
          <li>
            <button onClick={handleCopyAuthorID}>Copy Author ID</button>
          </li>
          <li>
            <button onClick={handleCopyNoteID}>Copy Event ID</button>
          </li>
          {myPubKey !== event.pubkey && event.kind !== 9735 && (
            <>
              <li>
                <button onClick={handleMute}>
                  {muted ? "Unmute User" : "Mute User"}
                </button>
              </li>
              <li>
                <button onClick={handleReporting}>Report</button>
              </li>
            </>
          )}
          {event.pubkey === myPubKey && (
            <li>
              <button onClick={handleDeletionRequest}>Request deletion</button>
            </li>
          )}
        </ul>
      </Dropdown>
    </div>
  )
}

export default FeedItemDropdown
