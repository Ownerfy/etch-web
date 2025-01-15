import {requestProvider} from "@getalby/bitcoin-connect"
import {shouldHideEvent} from "@/utils/socialGraph.ts"
import useProfile from "@/shared/hooks/useProfile.ts"
import {UserContext} from "@/context/UserContext.tsx"
import {useContext, useEffect, useState} from "react"
import {getZappingUser} from "@/utils/nostr.ts"
import {LRUCache} from "typescript-lru-cache"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import {useLocalState} from "irisdb-hooks"
import {statCalc} from "@/utils/utils.ts"
import Icon from "../../Icons/Icon.tsx"
import ZapModal from "../ZapModal.tsx"
import debounce from "lodash/debounce"
import {localState} from "irisdb"
import {ndk} from "irisdb-nostr"
import * as bolt11 from "bolt11"

const zapsByEventCache = new LRUCache<string, Map<string, NDKEvent[]>>({
  maxSize: 100,
})

interface FeedItemZapProps {
  event: NDKEvent
}

// TODO fix useLocalState so initial state is properly set from memory, so we can use it instead of this
let myPubKey = ""
localState.get("user/publicKey").on((k) => (myPubKey = k as string))

function FeedItemZap({event}: FeedItemZapProps) {
  const [isWalletConnect] = useLocalState("user/walletConnect", false)
  const [defaultZapAmount] = useLocalState("user/defaultZapAmount", undefined)

  const profile = useProfile(event.pubkey)

  const {zapRefresh, setZapRefresh} = useContext(UserContext)

  const [showZapModal, setShowZapModal] = useState(false)

  const [zapsByAuthor, setZapsByAuthor] = useState<Map<string, NDKEvent[]>>(
    zapsByEventCache.get(event.id) || new Map()
  )

  const calculateZappedAmount = (zaps: Map<string, NDKEvent[]>): number => {
    return Array.from(zaps.values())
      .flat()
      .reduce((sum, zap) => {
        const invoice = zap.tagValue("bolt11")
        if (invoice) {
          const decodedInvoice = bolt11.decode(invoice)
          return sum + (decodedInvoice.satoshis || 0)
        }
        return sum
      }, 0)
  }

  const [zappedAmount, setZappedAmount] = useState<number>(
    calculateZappedAmount(zapsByAuthor)
  )

  const handleZapClick = async () => {
    if (isWalletConnect && !!defaultZapAmount) {
      handleOneClickZap()
    } else {
      setShowZapModal(true)
    }
  }

  const handleOneClickZap = async () => {
    try {
      const provider = await requestProvider()
      const amount = Number(defaultZapAmount) * 1000
      const bolt11PaymentRequest = await event.zap(amount)
      if (bolt11PaymentRequest) {
        provider.sendPayment(bolt11PaymentRequest)
        setZapRefresh(!zapRefresh)
      }
    } catch (error) {
      console.warn("Unable to one-click zap:", error)
    }
  }

  useEffect(() => {
    const filter = {
      kinds: [9735],
      ["#e"]: [event.id],
    }

    try {
      const sub = ndk().subscribe(filter)
      const debouncedUpdateAmount = debounce((zapsByAuthor) => {
        setZappedAmount(calculateZappedAmount(zapsByAuthor))
      }, 300)

      sub?.on("event", (zapEvent: NDKEvent) => {
        if (shouldHideEvent(zapEvent)) return
        const invoice = zapEvent.tagValue("bolt11")
        if (invoice) {
          const decodedInvoice = bolt11.decode(invoice)
          if (decodedInvoice.complete && decodedInvoice.satoshis) {
            setZapsByAuthor((prev) => {
              const zappingUser = getZappingUser(zapEvent)
              const newMap = new Map(prev)
              const authorZaps = newMap.get(zappingUser) ?? []
              if (!authorZaps.some((e) => e.id === zapEvent.id)) {
                authorZaps.push(zapEvent)
              }
              newMap.set(zappingUser, authorZaps)
              zapsByEventCache.set(event.id, newMap)
              debouncedUpdateAmount(newMap)
              return newMap
            })
          }
        }
      })

      return () => {
        debouncedUpdateAmount.cancel()
        sub.stop()
      }
    } catch (error) {
      console.warn(error)
    }
  }, [])

  const zapped = zapsByAuthor.has(myPubKey)

  if (!(profile?.lud16 || profile?.lud06)) {
    return null
  }

  return (
    <>
      {showZapModal && (
        <ZapModal
          onClose={() => setShowZapModal(false)}
          event={event}
          zapped={zapped}
          setZapped={() => {}}
        />
      )}
      <div
        title="Zap"
        className={`${
          zapped ? "cursor-pointer text-accent" : "cursor-pointer hover:text-accent"
        } flex flex-row items-center gap-1 transition duration-200 ease-in-out min-w-[50px] md:min-w-[80px]`}
        onClick={handleZapClick}
      >
        <Icon name={zapped ? "zap-solid" : "zap"} size={16} />
        <span>{statCalc(zappedAmount)}</span>
      </div>
    </>
  )
}

export default FeedItemZap
