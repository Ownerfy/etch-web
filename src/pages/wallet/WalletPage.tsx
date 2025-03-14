import RightColumn from "@/shared/components/RightColumn.tsx"
import Trending from "@/shared/components/feed/Trending.tsx"
import Widget from "@/shared/components/ui/Widget"
import {useLocalState} from "irisdb-hooks"

export default function WalletPage() {
  const [myPubKey] = useLocalState("user/publicKey", "")

  return (
    <div className="flex justify-center h-screen">
      <div className="flex-1 overflow-hidden">
        {myPubKey && (
          <iframe
            src="/cashu"
            className="w-full h-full border-none"
            title="Cashu Wallet"
          />
        )}
      </div>
      <RightColumn>
        {() => (
          <>
            <Widget title="Nostr trending posts">
              <Trending />
            </Widget>
          </>
        )}
      </RightColumn>
    </div>
  )
}
