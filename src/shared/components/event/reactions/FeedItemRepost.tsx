import {useLocation} from "react-router-dom"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import {useEffect, useState} from "react"
import debounce from "lodash/debounce"
import {ndk} from "irisdb-nostr"

import NoteCreator from "@/shared/components/create/NoteCreator.tsx"
import Dropdown from "@/shared/components/ui/Dropdown"
import Modal from "@/shared/components/ui/Modal.tsx"
import {serializeEvent} from "@/utils/nostr.ts"
import {LRUCache} from "typescript-lru-cache"
import {statCalc} from "@/utils/utils.ts"
import Icon from "../../Icons/Icon"

import {shouldHideEvent} from "@/utils/socialGraph"
import {localState} from "irisdb"

interface FeedItemRepostProps {
  event: NDKEvent
}

const repostCache = new LRUCache<string, Set<string>>({
  maxSize: 100,
})

let myPubKey = ""
localState.get("user/publicKey").on((k) => (myPubKey = k as string))

function FeedItemRepost({event}: FeedItemRepostProps) {
  const location = useLocation()

  const cachedReposts = repostCache.get(event.id)
  const [repostsByAuthor, setRepostsByAuthor] = useState<Set<string>>(
    cachedReposts || new Set()
  )
  const [repostCount, setRepostCount] = useState(repostsByAuthor.size)
  const [showButtons, setShowButtons] = useState(false)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const reposted = repostsByAuthor.has(myPubKey)

  const handleRepost = async () => {
    if (reposted) return
    setShowButtons(false)
    try {
      if (event.kind === 1) {
        event.repost()
        setRepostsByAuthor((prev) => {
          const newSet = new Set(prev)
          newSet.add(myPubKey)
          repostCache.set(event.id, newSet)
          setRepostCount(newSet.size)
          return newSet
        })
      } else {
        const repostEvent = new NDKEvent()
        repostEvent.ndk = ndk()
        repostEvent.kind = 9372
        repostEvent.content = serializeEvent(event)
        repostEvent.tags = [["e", event.id, "", "mention", event.pubkey]]

        await repostEvent.publish()
        setRepostsByAuthor((prev) => {
          const newSet = new Set(prev)
          newSet.add(myPubKey)
          repostCache.set(event.id, newSet)
          setRepostCount(newSet.size)
          return newSet
        })
      }
    } catch (error) {
      console.warn("Unable to repost", error)
    }
  }

  const handleQuote = () => {
    setShowButtons(false)
    setShowQuoteModal(true)
  }

  useEffect(() => {
    const filter = {
      kinds: [6],
      ["#e"]: [event.id],
    }

    try {
      const sub = ndk().subscribe(filter)

      const debouncedUpdate = debounce((repostsByAuthor) => {
        setRepostCount(repostsByAuthor.size)
      }, 300)

      sub?.on("event", (repostEvent: NDKEvent) => {
        if (shouldHideEvent(repostEvent)) return
        setRepostsByAuthor((prev) => {
          const newSet = new Set(prev)
          newSet.add(repostEvent.pubkey)
          repostCache.set(event.id, newSet)
          debouncedUpdate(newSet)
          return newSet
        })
      })

      return () => {
        sub.stop()
        debouncedUpdate.cancel()
      }
    } catch (error) {
      console.warn(error)
    }
  }, [location.pathname])

  return (
    <>
      {showQuoteModal && (
        <Modal onClose={() => setShowQuoteModal(false)}>
          <NoteCreator handleClose={() => setShowQuoteModal(false)} quotedEvent={event} />
        </Modal>
      )}
      <div
        title="Repost"
        className={`${
          reposted ? "cursor-pointer text-success" : "cursor-pointer hover:text-success"
        } m-1 transition-colors duration-200 ease-in-out dropdown dropdown-open flex flex-row gap-1 items-center min-w-[50px] md:min-w-[80px]`}
        onClick={() => myPubKey && setShowButtons(!showButtons)}
      >
        <Icon name="repost" size={16} />
        <div>
          {showButtons && (
            <Dropdown onClose={() => setShowButtons(false)}>
              <ul className="p-2 gap-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-32">
                <li>
                  <button className="btn btn-primary btn-sm" onClick={handleRepost}>
                    Repost
                  </button>
                </li>
                <li>
                  <button className="btn btn-primary btn-sm" onClick={handleQuote}>
                    Quote
                  </button>
                </li>
              </ul>
            </Dropdown>
          )}
        </div>
        <span>{statCalc(repostCount)}</span>
      </div>
    </>
  )
}

export default FeedItemRepost
