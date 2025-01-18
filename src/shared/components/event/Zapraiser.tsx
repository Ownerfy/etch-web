import {useContext, useEffect, useState} from "react"
import {UserContext} from "@/context/UserContext"
import {fetchZappedAmount} from "@/utils/nostr"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import HyperText from "../HyperText"

interface ZapraiserProps {
  event: NDKEvent
}

function Zapraiser({event}: ZapraiserProps) {
  const [zapProgress, setZapProgress] = useState(0)

  const {zapRefresh} = useContext(UserContext)

  useEffect(() => {
    fetchZappedAmount(event).then((amount: number) => {
      if (amount > 0) {
        try {
          const targetAmount = Number(event.tagValue("zapraiser"))
          const percent = Math.round((amount / targetAmount) * 100)
          if (percent > 100) {
            setZapProgress(100)
          } else {
            setZapProgress(percent)
          }
        } catch (error) {
          // ignore, event is probably malformed
        }
      }
    })
  }, [event, zapRefresh])

  return (
    <div className="Zapraiser flex flex-col gap-2">
      <h1 className="flex gap-2">
        <b>{event.tagValue("title")}</b>
        <span className="text-gray-500">
          in repository <b>{event.tagValue("repo")}</b>
        </span>
      </h1>
      <HyperText>{event.content}</HyperText>
      <div className="flex flex-col gap-2 mt-4 mb-2">
        <p className="self-center">Zap Goal {zapProgress} %</p>
        <div className="w-full h-4 bg-gray-200 rounded">
          <div
            className="h-full bg-purple-500 rounded"
            style={{width: `${zapProgress}%`}}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default Zapraiser
