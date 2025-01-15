import {ChangeEvent, useCallback, useState} from "react"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import {useLocalState} from "irisdb-hooks"
import {ndk} from "irisdb-nostr"

import {publishReply} from "@/shared/services/FeedServices.tsx"
import {UserRow} from "@/shared/components/user/UserRow.tsx"

interface ReplyItemProps {
  event: NDKEvent
  onSubmit: () => void
}

function ReplyItem({event, onSubmit}: ReplyItemProps) {
  const [replyContent, setReplyContent] = useState("")

  const [myPubKey] = useLocalState("user/publicKey", "")
  const [myDHTPubKey] = useLocalState("user/DHTPublicKey", "")

  const handleReplySubmit = async () => {
    await publishReply(ndk(), replyContent, event, myDHTPubKey)
      .then(() => {
        onSubmit()
      })
      .catch((error) => {
        console.warn("Unable to publish reply", error)
      })
  }

  const handleTextChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => setReplyContent(event.target.value),
    []
  )

  return (
    <article className="bg-base-100 p-4 rounded-lg shadow">
      <header className="flex items-center gap-2 cursor-pointer">
        <UserRow pubKey={myPubKey} />
      </header>
      <div className="mt-4 flex flex-col gap-2">
        <textarea
          className="textarea textarea-bordered w-full"
          onChange={handleTextChange}
          placeholder="Write a reply..."
        />
        <div className="flex justify-end">
          <button className="btn btn-primary" onClick={handleReplySubmit}>
            Reply
          </button>
        </div>
      </div>
    </article>
  )
}

export default ReplyItem
