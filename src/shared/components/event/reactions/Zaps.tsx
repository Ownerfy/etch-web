import {getZapAmount, getZappingUser} from "@/utils/nostr.ts"
import {UserRow} from "@/shared/components/user/UserRow.tsx"
// import {shouldHideEvent} from "@/utils/socialGraph"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import {useEffect, useState} from "react"
import {ndk} from "irisdb-nostr"

export default function Zaps({event}: {event: NDKEvent}) {
  const [zapAmountByUser, setZapAmountByUser] = useState(new Map<string, number>())
  const [commentByUser, setCommentByUser] = useState(new Map<string, string>())

  useEffect(() => {
    try {
      setZapAmountByUser(new Map())
      setCommentByUser(new Map())
      const filter = {
        kinds: [9735],
        ["#e"]: [event.id],
      }
      const sub = ndk().subscribe(filter)

      sub?.on("event", (event: NDKEvent) => {
        // if (shouldHideEvent(event)) return
        const user = getZappingUser(event)
        setZapAmountByUser((prev) => {
          const amount = getZapAmount(event)
          prev.set(user, (prev.get(user) || 0) + amount)
          return new Map(prev)
        })
        setCommentByUser((prev) => {
          const comment = event.content
          prev.set(user, comment)
          return new Map(prev)
        })
      })
      return () => {
        sub.stop()
      }
    } catch (error) {
      console.warn(error)
    }
  }, [event.id])

  return (
    <div className="flex flex-col gap-4">
      {zapAmountByUser.size === 0 && <p>No zaps yet</p>}
      {Array.from(zapAmountByUser.entries())
        .sort(([, a], [, b]) => b - a)
        .map(([pubKey, amount]) => (
          <UserRow
            showHoverCard={true}
            key={event.id}
            pubKey={pubKey}
            description={`${commentByUser.get(pubKey)} ${String(amount)}`}
          />
        ))}
    </div>
  )
}
