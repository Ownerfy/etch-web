import {ReactNode, useCallback, useEffect, useMemo, useState} from "react"
export interface RelativeTimeProps {
  from: number
  fallback?: string
}

const secondsInAMinute = 60
const secondsInAnHour = secondsInAMinute * 60
const secondsInADay = secondsInAnHour * 24

function RelativeTime({from, fallback}: RelativeTimeProps) {
  const calcTime = useCallback((fromTime: number) => {
    const currentTime = new Date()
    const timeDifference = Math.floor((currentTime.getTime() - fromTime) / 1000)

    if (timeDifference < secondsInAMinute) {
      return "now"
    } else if (timeDifference < secondsInAnHour) {
      return `${Math.floor(timeDifference / secondsInAMinute)}m`
    } else if (timeDifference < secondsInADay) {
      return `${Math.floor(timeDifference / secondsInAnHour)}h`
    } else {
      const fromDate = new Date(fromTime)
      if (fromDate.getFullYear() === currentTime.getFullYear()) {
        return fromDate.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      } else {
        return fromDate.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      }
    }
  }, [])

  const [time, setTime] = useState<string | ReactNode>(calcTime(from))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(calcTime(from))
    }, 60000)

    return () => clearInterval(interval)
  }, [from, calcTime])

  const absoluteTime = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "long",
      }).format(from),
    [from]
  )

  const isoDate = useMemo(() => new Date(from).toISOString(), [from])

  return (
    <time dateTime={isoDate} title={absoluteTime}>
      {time || fallback}
    </time>
  )
}

export default RelativeTime
