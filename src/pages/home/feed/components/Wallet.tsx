import {ArrowDownward, ArrowUpward, Bolt} from "@mui/icons-material"
import {useState} from "react"

import satoshiSymbolWhite from "@/assets/satoshi-white.png"
import satoshiSymbol from "@/assets/satoshi.svg"
import bitcoinLogo from "@/assets/Bitcoin.png"

import WalletFeedItem from "./WalletFeedItem"

function Wallet() {
  const [walletToggle, setWalletToggle] = useState<"lightning" | "on-chain">("lightning")

  const handleLightningToggleChange = () => {
    setWalletToggle((prev) => (prev === "lightning" ? "on-chain" : "lightning"))
  }

  return (
    <section>
      <div>
        <h2 className="text-2xl font-bold flex items-center mb-4">
          <img src={bitcoinLogo} className="w-8 h-8 mr-2" alt="Bitcoin logo" /> Wallet
        </h2>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bolt className="mr-2" /> Lightning
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={walletToggle === "on-chain"}
            onChange={handleLightningToggleChange}
          />
          <div className="flex items-center">
            <img src={satoshiSymbolWhite} className="w-6 h-6 mr-2" alt="satoshi symbol" />{" "}
            On-chain
          </div>
        </div>
        <div className="border p-4 rounded-lg mb-4">
          <div className="flex justify-center items-center">
            {walletToggle === "lightning" && (
              <div className="flex items-center text-xl">
                <Bolt className="text-yellow-500 mr-2" />
                <span>-1 sats</span>
              </div>
            )}
            {walletToggle === "on-chain" && (
              <div className="flex items-center text-xl font-bold">
                <img src={satoshiSymbol} alt="satoshi symbol" className="w-6 h-6 mr-2" />
                <span>-1 sats</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between mb-4">
          <button className="btn btn-primary flex items-center">
            Send <ArrowUpward className="ml-2" />
          </button>
          <button className="btn btn-primary flex items-center">
            Receive <ArrowDownward className="ml-2" />
          </button>
        </div>
      </div>
      <div>
        <WalletFeedItem />
        <WalletFeedItem />
        <WalletFeedItem />
        <WalletFeedItem />
      </div>
    </section>
  )
}

export default Wallet
