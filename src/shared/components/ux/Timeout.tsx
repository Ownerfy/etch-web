// Timeout.tsx
import {useEffect, useState} from "react"

interface TimeoutProps {
  loading: boolean
  time?: number //in milliseconds. Default is 8000 (below)
}

function Timeout({loading, time = 8000}: TimeoutProps) {
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  useEffect(() => {
    let timeoutId: number
    if (loading && !loadingTimeout) {
      timeoutId = window.setTimeout(() => {
        setLoadingTimeout(true)
      }, time)
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [loading, loadingTimeout])

  if (loadingTimeout) {
    return (
      <div className="primary-text-color">
        Loading is taking longer than expected. Please{" "}
        <a href={window.location.href}>reload</a> the page.
      </div>
    )
  }
  return null
}

export default Timeout
