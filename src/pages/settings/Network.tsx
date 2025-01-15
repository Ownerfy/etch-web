import {FormEvent, useEffect, useMemo, useState} from "react"
import {DEFAULT_RELAYS, ndk as getNdk} from "irisdb-nostr"
import {RiDeleteBinLine} from "@remixicon/react"
import {useLocalState} from "irisdb-hooks"

import {createSignedDHTPayload, uint8ArrayToHexString} from "@/utils/utils"
import Show from "@/shared/components/Show.tsx"
import {NDKEvent} from "@nostr-dev-kit/ndk"

export function Network() {
  const ndk = getNdk()
  const [ndkRelays, setNdkRelays] = useState(new Map(ndk.pool.relays))
  const [connectToRelayUrls, setConnectToRelayUrls] = useLocalState(
    "user/relays",
    Array.from(ndk.pool.relays.keys())
  )
  const [newRelayUrl, setNewRelayUrl] = useState("")
  const [dhtPubKey] = useLocalState("user/DHTPublicKey", "")
  const [dhtPrivKey] = useLocalState("user/DHTPrivateKey", "")

  useEffect(() => {
    const updateRelays = () => {
      setNdkRelays(new Map(ndk.pool.relays))
    }
    updateRelays()
    const interval = setInterval(updateRelays, 1000)
    return () => clearInterval(interval)
  }, [])

  const addRelay = (e: FormEvent) => {
    e.preventDefault()
    let url = newRelayUrl.trim()
    if (!url) return
    if (!url.startsWith("wss://") && !url.startsWith("ws://")) {
      url = `wss://${url}`
    }
    setConnectToRelayUrls([...(connectToRelayUrls || []), url])
    setNewRelayUrl("")
  }

  const removeRelay = (url: string) => {
    setConnectToRelayUrls(
      (connectToRelayUrls || Array.from(ndkRelays.keys())).filter((u) => u !== url)
    )
  }

  const resetDefaults = () => {
    setConnectToRelayUrls(DEFAULT_RELAYS)
  }

  const hasDefaultRelays = useMemo(
    () =>
      connectToRelayUrls?.every((url) => DEFAULT_RELAYS.includes(url)) &&
      connectToRelayUrls?.length === DEFAULT_RELAYS.length,
    [connectToRelayUrls]
  )

  // send modified relay list to relays for storing in BitTorrent DHT
  useEffect(() => {
    if (connectToRelayUrls && dhtPrivKey) {
      const dhtPrivKeyUint8Array = Uint8Array.from(Buffer.from(dhtPrivKey, "hex"))
      createSignedDHTPayload(
        dhtPrivKeyUint8Array,
        JSON.stringify(connectToRelayUrls)
      ).then((payload) => {
        const payloadHex = uint8ArrayToHexString(payload.payload)
        const dhtSigHex = uint8ArrayToHexString(payload.dht_sig)

        const relayListEvent = new NDKEvent()
        relayListEvent.ndk = ndk
        relayListEvent.kind = 11011
        relayListEvent.content = payloadHex
        relayListEvent.tags = [
          ["dht_sig", dhtSigHex],
          ["dht_pubkey", dhtPubKey],
        ]
        relayListEvent.publish()
      })
    }
  }, [connectToRelayUrls, dhtPrivKey])

  return (
    <div>
      <h2 className="text-2xl mb-4">Network</h2>
      <div className="divide-y divide-base-300">
        {connectToRelayUrls?.map((url) => {
          const relay = ndkRelays.get(url)
          return (
            <div key={url} className="py-2 flex justify-between items-center">
              <span className="text-lg font-medium">
                {url.replace("wss://", "").replace(/\/$/, "")}
              </span>
              <div className="flex items-center gap-4">
                <RiDeleteBinLine
                  className="cursor-pointer"
                  onClick={() => removeRelay(url)}
                />
                <span
                  className={`badge ${relay?.status === 1 ? "badge-success" : "badge-error"}`}
                ></span>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-4">
        <form onSubmit={addRelay}>
          <input
            type="text"
            placeholder="Add relay"
            className="input input-bordered w-full max-w-xs"
            value={newRelayUrl}
            onChange={(e) => setNewRelayUrl(e.target.value)}
          />
          <button className="btn btn-primary ml-2">Add Relay</button>
        </form>
      </div>
      <Show when={!hasDefaultRelays}>
        <div className="mt-4">
          <button className="btn btn-secondary" onClick={resetDefaults}>
            Reset to defaults
          </button>
        </div>
      </Show>
    </div>
  )
}
