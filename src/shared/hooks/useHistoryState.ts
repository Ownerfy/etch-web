import {useEffect, useRef, useState} from "react"
import throttle from "lodash/throttle"

export default function useHistoryState<T>(initialValue: T, key: string) {
  const currentHistoryState = history.state ? history.state[key] : undefined
  const myInitialValue =
    currentHistoryState === undefined ? initialValue : currentHistoryState
  const [state, setState] = useState(myInitialValue)

  const latestValue = useRef(state)

  const throttledSetHistoryState = useRef(
    throttle((value) => {
      const newHistoryState = {...history.state, [key]: value}
      history.replaceState(newHistoryState, "")
      latestValue.current = value
    }, 1000)
  )

  useEffect(() => {
    if (state !== latestValue.current) {
      throttledSetHistoryState.current(state)
      latestValue.current = state
    }

    // Cleanup logic
    return () => {
      throttledSetHistoryState.current.cancel() // Cancel any throttled call
      if (state !== latestValue.current) {
        const newHistoryState = {...history.state, [key]: state}
        history.replaceState(newHistoryState, "") // Save the final state
      }
    }
  }, [state, key])

  const popStateListener = (event: PopStateEvent) => {
    if (event.state && key in event.state) {
      setState(event.state[key])
    }
  }

  useEffect(() => {
    window.addEventListener("popstate", popStateListener)
    return () => {
      window.removeEventListener("popstate", popStateListener)
    }
  }, [])

  return [state, setState]
}
