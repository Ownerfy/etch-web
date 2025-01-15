import {NDKEvent} from "@nostr-dev-kit/ndk"
import {useEffect, useState} from "react"
import {UserRow} from "../user/UserRow"
import * as bolt11 from "bolt11"

interface ZapReceiptProps {
  event: NDKEvent
}

function ZapReceipt({event}: ZapReceiptProps) {
  const [zappedAmount, setZappedAmount] = useState<number>()

  useEffect(() => {
    const invoice = event.tagValue("bolt11")
    if (invoice) {
      const decodedInvoice = bolt11.decode(invoice)
      if (decodedInvoice.complete && decodedInvoice.satoshis)
        setZappedAmount(decodedInvoice.satoshis)
    }
  }, [])

  return (
    <div>
      <div className="flex items-center gap-2">
        <p className="">Zapped {zappedAmount} sats to</p>
        <UserRow pubKey={event.tagValue("p") || ""} avatarWidth={30} />
      </div>
      <p>{event.content}</p>
    </div>
  )
}

export default ZapReceipt
