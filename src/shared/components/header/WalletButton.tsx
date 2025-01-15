import {useLocalState} from "irisdb-hooks"

import Wallet from "@/pages/home/feed/components/Wallet.tsx"
import Icon from "@/shared/components/Icons/Icon"

import Modal from "../ui/Modal"

import {useState} from "react"

export default function WalletButton() {
  const [showWallet, setShowWallet] = useState(false)
  const [pubKey] = useLocalState("user/publicKey", "")

  if (!pubKey) {
    return null
  }

  return (
    <>
      <button
        title="Wallet"
        className="btn btn-ghost rounded-full md:aspect-square xl:aspect-auto"
        onClick={() => setShowWallet(!showWallet)}
      >
        <Icon name="wallet" className="w-6 h-6" />
        <div className="md:hidden xl:inline">Wallet</div>
      </button>
      {showWallet && (
        <Modal onClose={() => setShowWallet(false)}>
          <Wallet />
        </Modal>
      )}
    </>
  )
}
