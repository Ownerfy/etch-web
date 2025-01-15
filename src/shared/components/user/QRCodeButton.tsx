import CopyButton from "@/shared/components/button/CopyButton.tsx"
import {useEffect, useState, lazy, Suspense, useMemo} from "react"
import Modal from "@/shared/components/ui/Modal.tsx"
import Icon from "@/shared/components/Icons/Icon"
import {useNavigate} from "react-router-dom"
import {PublicKey} from "irisdb-nostr"
import {UserRow} from "./UserRow"
import QRCode from "qrcode"

const QRScanner = lazy(() => import("../QRScanner"))

interface QRCodeModalProps {
  onClose: () => void
  data: string
  onScanSuccess?: (data: string) => void
  npub?: string
  initialShowScanner?: boolean
}

function QRCodeModal({
  onClose,
  data,
  onScanSuccess,
  npub,
  initialShowScanner = false,
}: QRCodeModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [showScanQr, setShowScanQr] = useState(initialShowScanner)
  const navigate = useNavigate()

  useEffect(() => {
    QRCode.toDataURL(data, (error, url) => {
      if (error) console.error("Error generating QR code:", error)
      else setQrCodeUrl(url)
    })
  }, [data])

  const irisLink = `https://etch.social${location.pathname}`

  const [isCameraAvailable, setIsCameraAvailable] = useState(false)

  useEffect(() => {
    async function checkCameraAvailability() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const hasCamera = devices.some((device) => device.kind === "videoinput")
        setIsCameraAvailable(hasCamera)
      } catch (error) {
        console.error("Error checking camera availability:", error)
        setIsCameraAvailable(false)
      }
    }

    checkCameraAvailability()
  }, [])

  const defaultOnScanSuccess = (scannedData: string) => {
    onClose()
    try {
      const k = new PublicKey(scannedData.replace("nostr:", "")).toBech32("npub")
      navigate(`/${k}`)
    } catch (e) {
      console.log("got qr data", scannedData)
      // ignore
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col items-center justify-center p-4 gap-4">
        {showScanQr ? (
          <Suspense fallback={<div>Loading scanner...</div>}>
            <QRScanner onScanSuccess={onScanSuccess || defaultOnScanSuccess} />
          </Suspense>
        ) : (
          <>
            {npub && (
              <UserRow linkToProfile={false} pubKey={npub} textClassName="font-bold" />
            )}
            {qrCodeUrl && (
              <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64 rounded-2xl" />
            )}
            <p className="text-xs break-all select-all">{data}</p>
            <div className="flex gap-2">
              <CopyButton
                className="btn btn-sm btn-neutral"
                copyStr={data}
                text="Copy data"
              />
              <CopyButton
                className="btn btn-sm btn-neutral"
                copyStr={irisLink}
                text="Copy link"
              />
              {navigator.share && (
                <button
                  className="btn btn-sm btn-neutral"
                  onClick={() =>
                    navigator.share({
                      title: "Check out this profile on Etch",
                      url: irisLink,
                    })
                  }
                >
                  Share link
                </button>
              )}
            </div>
          </>
        )}
        {isCameraAvailable && (
          <>
            <hr className="border-b border-base-content/20 w-full my-4" />
            <button
              className={`btn btn-neutral`}
              onClick={() => setShowScanQr(!showScanQr)}
            >
              {showScanQr ? (
                "Close"
              ) : (
                <>
                  <Icon name="camera-plus" className="h-6 w-6" /> Scan QR
                </>
              )}
            </button>
          </>
        )}
      </div>
    </Modal>
  )
}

interface QRCodeButtonProps {
  data: string
  onScanSuccess?: (data: string) => void
  npub?: string
  showQRCode?: boolean
  icon?: string
}

function QRCodeButton({
  data,
  onScanSuccess,
  npub,
  showQRCode = true,
  icon = "qr",
}: QRCodeButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const computedNpub = useMemo(() => {
    if (npub) {
      return npub
    }
    if (data.startsWith("nostr:npub")) {
      return data.slice(6)
    }
    return ""
  }, [data, npub])

  return (
    <>
      <button
        onClick={openModal}
        className="p-2 btn btn-neutral btn-circle"
        aria-label={showQRCode ? "Show QR Code" : "Scan QR Code"}
      >
        <Icon name={icon} className="w-4 h-4" />
      </button>
      {isModalOpen && (
        <QRCodeModal
          onClose={closeModal}
          data={data}
          onScanSuccess={onScanSuccess}
          npub={computedNpub}
          initialShowScanner={!showQRCode}
        />
      )}
    </>
  )
}

export default QRCodeButton
