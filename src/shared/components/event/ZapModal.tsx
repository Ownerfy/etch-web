import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
  FormEvent,
} from "react"
import {NDKEvent, zapInvoiceFromEvent} from "@nostr-dev-kit/ndk"
import {Check, ContentCopy} from "@mui/icons-material"
import * as bolt11 from "bolt11"
import QRCode from "qrcode"

import {requestProvider} from "@getalby/bitcoin-connect-react"
import zapAnimation from "@/assets/zap-animation.gif"
import Modal from "@/shared/components/ui/Modal.tsx"
import {UserContext} from "@/context/UserContext"
import {useLocalState} from "irisdb-hooks"
import {ndk} from "irisdb-nostr"

interface ZapModalProps {
  onClose: () => void
  event: NDKEvent
  zapped: boolean
  setZapped: Dispatch<SetStateAction<boolean>>
  rezappedEvent?: NDKEvent
}

function ZapModal({onClose, event, zapped, setZapped, rezappedEvent}: ZapModalProps) {
  const [defaultZapAmount] = useLocalState("user/defaultZapAmount", 21)
  const [copiedPaymentRequest, setCopiedPaymentRequest] = useState(false)
  const [noAddress, setNoAddress] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [bolt11Invoice, setBolt11Invoice] = useState<string>("")
  const [zapAmount, setZapAmount] = useState<string>("21000")
  const [zapMessage, setZapMessage] = useState<string>("")

  const [isWalletConnect] = useLocalState("user/walletConnect", false)

  const {zapRefresh, setZapRefresh} = useContext(UserContext)

  const handleZapAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    setZapAmount(event.target.value)
  }

  const handleZapMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setZapMessage(event.target.value)
  }

  const handleCopyPaymentRequest = () => {
    navigator.clipboard.writeText(bolt11Invoice)
    setCopiedPaymentRequest(true)
    setTimeout(() => {
      setCopiedPaymentRequest(false)
    }, 3000)
  }

  const handleZap = async () => {
    setNoAddress(false)
    try {
      if (Number(zapAmount) < 1) return
    } catch (error) {
      console.warn("Zap amount must be a number: ", error)
    }
    try {
      const amount = Number(zapAmount) * 1000
      const bolt11PaymentRequest = await event.zap(amount)

      if (bolt11PaymentRequest) {
        if (isWalletConnect) {
          const provider = await requestProvider()
          provider.sendPayment(bolt11PaymentRequest)
          setZapped(true)
          setZapRefresh(!zapRefresh)
        } else {
          // no Nostr wallet connect set
          setBolt11Invoice(bolt11PaymentRequest)
          const img = document.getElementById("qr-image") as HTMLImageElement

          QRCode.toDataURL(bolt11PaymentRequest, function (error, url) {
            if (error) console.error("Error generating QR code:", error)
            else img.src = url
          })
          setShowQRCode(true)
        }
      }
    } catch (error) {
      console.warn("Zap failed: ", error)
      if (error instanceof Error && error.message.includes("No zap endpoint found")) {
        setNoAddress(true)
      }
    }
  }

  const rezap = async (receipt: NDKEvent) => {
    if (rezappedEvent && receipt) {
      const rezapEvent = new NDKEvent(ndk())
      rezapEvent.kind = 1
      rezapEvent.tags = [
        ["e", rezappedEvent.id, "", "mention", rezappedEvent.pubkey],
        ["e", rezappedEvent.id, "", "rezap", rezappedEvent.pubkey],
      ]
      rezapEvent.content = `nostr:${receipt.encode()}\nnostr:${rezappedEvent.encode()}`
      await rezapEvent
        .publish()
        .catch((error) => console.warn("Unable to publish rezap event", error))
    }
  }

  const fetchZapReceipt = () => {
    const filter = {
      kinds: [9735],
      ["#e"]: [event.id],
    }
    try {
      const sub = ndk().subscribe(filter)

      sub?.on("event", (event: NDKEvent) => {
        sub.stop()
        const receiptInvoice = event.tagValue("bolt11")
        if (receiptInvoice) {
          const decodedInvoice = bolt11?.decode(receiptInvoice)

          const zapRequest = zapInvoiceFromEvent(event)

          const invoiceComplete = decodedInvoice.complete
          const amountPaid = decodedInvoice.satoshis
          const amountRequested = zapRequest?.amount ? zapRequest.amount / 1000 : -1

          if (
            bolt11Invoice === receiptInvoice &&
            invoiceComplete &&
            amountPaid === amountRequested
          ) {
            if (rezappedEvent) rezap(event)
            setZapped(true)
            setTimeout(() => {
              setZapAmount("21000")
              setZapped(false)
              setShowQRCode(false)
              onClose()
            }, 4500)
          }
        }
      })
    } catch (error) {
      console.warn("Unable to fetch zap receipt", error)
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      fetchZapReceipt()
    }, 2500)

    return () => {
      clearInterval(timer)
    }
  }, [showQRCode])

  // wait for defaultZapAmount to populate
  useEffect(() => {
    if (defaultZapAmount) setZapAmount(String(defaultZapAmount))
  }, [defaultZapAmount])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleZap()
  }

  return (
    <Modal onClose={onClose} hasBackground={!zapped}>
      <div className="flex flex-col items-center justify-center p-4">
        {!zapped && (
          <div className="flex flex-col items-center gap-4">
            {showQRCode && (
              <p>
                Scan the QR code to zap <b>{zapAmount} sats</b>.
              </p>
            )}
            <img id="qr-image" className={showQRCode ? "w-40 h-40" : ""} />
            {showQRCode && (
              <>
                <a href={`lightning:${bolt11Invoice}`} className="btn btn-primary">
                  Open in Wallet
                </a>
                <button
                  className="btn btn-neutral gap-2"
                  onClick={handleCopyPaymentRequest}
                >
                  {!copiedPaymentRequest && <ContentCopy />}
                  {copiedPaymentRequest && <Check />}
                  Copy zap invoice
                </button>
              </>
            )}
            {!showQRCode && (
              <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
                <h3>Choose the amount to zap</h3>
                {noAddress && (
                  <span className="text-red-500">The user has no lightning address.</span>
                )}
                <div className="flex flex-col gap-2">
                  <label>Amount (sats)</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={zapAmount}
                    onChange={handleZapAmountChange}
                    placeholder="21000"
                  />
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={zapMessage}
                    onChange={handleZapMessageChange}
                    placeholder="message (optional)"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Zap
                </button>
              </form>
            )}
          </div>
        )}
        {zapped && (
          <div className="flex flex-col items-center">
            <img
              src={zapAnimation}
              className="max-w-[90vw] w-80"
              alt="zap successful animation"
            />
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ZapModal
