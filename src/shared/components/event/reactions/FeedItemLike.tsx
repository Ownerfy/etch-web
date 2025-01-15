import {shouldHideEvent} from "@/utils/socialGraph"
import {LRUCache} from "typescript-lru-cache"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import {statCalc} from "@/utils/utils.ts"
import {useEffect, useState} from "react"
import debounce from "lodash/debounce"
import Icon from "../../Icons/Icon"
import {localState} from "irisdb"
import {ndk} from "irisdb-nostr"

const likeCache = new LRUCache<string, Set<string>>({
  maxSize: 100,
})

let myPubKey = ""
localState.get("user/publicKey").on((k) => (myPubKey = k as string))

export const FeedItemLike = ({event}: {event: NDKEvent}) => {
  const cachedLikes = likeCache.get(event.id)

  const [likesByAuthor, setLikesByAuthor] = useState<Set<string>>(
    cachedLikes || new Set()
  )
  const [likeCount, setLikeCount] = useState(likesByAuthor.size)

  const like = async () => {
    if (likesByAuthor.has(myPubKey)) return
    try {
      event.react("+")
      setLikesByAuthor((prev) => {
        const newSet = new Set(prev)
        newSet.add(myPubKey)
        likeCache.set(event.id, newSet)
        setLikeCount(newSet.size)
        return newSet
      })
    } catch (error) {
      console.warn(`Could not publish reaction: ${error}`)
    }
  }

  const handleLike = async () => {
    if (!myPubKey) return
    try {
      await like()
    } catch (error) {
      console.error("Error handling like:", error)
    }
  }

  useEffect(() => {
    const filter = {
      kinds: [7],
      ["#e"]: [event.id],
    }

    try {
      const sub = ndk().subscribe(filter)

      const debouncedUpdate = debounce((likesByAuthor) => {
        setLikeCount(likesByAuthor.size)
      }, 300)

      sub?.on("event", (likeEvent: NDKEvent) => {
        if (shouldHideEvent(likeEvent)) return
        setLikesByAuthor((prev) => {
          const newSet = new Set(prev)
          newSet.add(likeEvent.pubkey)
          likeCache.set(event.id, newSet)
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
  }, [])

  const liked = likesByAuthor.has(myPubKey)

  return (
    <div
      title="Like"
      className={`min-w-[50px] md:min-w-[80px] transition-colors duration-200 ease-in-out cursor-pointer likeIcon ${liked ? "text-error" : "hover:text-error"} flex flex-row gap-1 items-center`}
      onClick={handleLike}
    >
      <Icon name={liked ? "heart-solid" : "heart"} size={16} />
      <span>{statCalc(likeCount)}</span>
    </div>
  )
}
