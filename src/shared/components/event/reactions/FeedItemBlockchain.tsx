import Icon from "@/shared/components/Icons/Icon"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import {useState} from "react"

const FeedItemBlockchain = ({event}: {event: NDKEvent}) => {
  const [isOpen, setIsOpen] = useState(false)

  // Find blockchain tag in format ["blockchain", "contract", "tokenId"]
  const blockchainTag = event.tags.find((tag) => tag[0] === "blockchain")
  if (!blockchainTag) return null

  const [, blockchain, contract, tokenId] = blockchainTag

  const links = [
    {
      name: "View on Etherscan",
      url: `https://basescan.org/token/${contract}?a=${tokenId}`,
      icon: "etherscan",
    },
    {
      name: "View on OpenSea",
      url: `https://opensea.io/assets/${blockchain}/${contract}/${tokenId}`,
      icon: "opensea",
    },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="min-w-[50px] md:min-w-[80px] hover:text-info"
        title="View on blockchain"
      >
        <Icon name="link" size={16} />
      </button>

      {isOpen && (
        <div className="absolute bottom-8 right-0 bg-base-200 rounded-lg shadow-xl p-2 min-w-[200px]">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 hover:bg-base-300 rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <Icon name={link.icon} size={16} />
              {link.name}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default FeedItemBlockchain
