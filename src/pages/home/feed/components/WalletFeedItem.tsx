import {Bolt} from "@mui/icons-material"

import {Avatar} from "@/shared/components/user/Avatar.tsx"
import {Name} from "@/shared/components/user/Name.tsx"

const WalletFeedItem = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <div className="flex items-center">
        <Bolt className="text-yellow-500 mr-2" />
        <span className="text-lg font-bold">-1</span>
      </div>
      <div className="flex items-center space-x-4">
        <Avatar pubKey="e17273fbad387f52e0c8102dcfc8d8310e56afb8f4ac4e7653e58c8d5f8abf12" />
        <div>
          <Name pubKey="e17273fbad387f52e0c8102dcfc8d8310e56afb8f4ac4e7653e58c8d5f8abf12" />
          <span className="block">
            Zapped you for a total of <b>-1</b> sats.
          </span>
          <span className="block text-gray-500">Zap message here.</span>
        </div>
      </div>
    </div>
  )
}

export default WalletFeedItem
