import socialGraph, {
  getFollowLists,
  loadFromFile,
  saveToFile,
  loadAndMerge,
  downloadLargeGraph,
} from "@/utils/socialGraph"
import {useState, useEffect} from "react"

function SocialGraphSettings() {
  const [socialGraphSize, setSocialGraphSize] = useState(socialGraph().size())

  useEffect(() => {
    const interval = setInterval(() => {
      setSocialGraphSize(socialGraph().size())
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // ... existing code ...

  const handleRecalculateFollowDistances = () => {
    socialGraph().recalculateFollowDistances()
    setSocialGraphSize(socialGraph().size())
  }

  return (
    <div>
      <h1 className="text-2xl mb-4">Social graph</h1>
      <div className="space-y-4 prose">
        <div>
          <b>Users</b>: {socialGraphSize.users}
        </div>
        <div>
          <b>Follow relationships</b>: {socialGraphSize.follows}
        </div>
        <div>
          <b>Users by follow distance</b>:
        </div>
        <div className="space-y-1">
          {Object.entries(socialGraphSize.sizeByDistance).map(([distance, size]) => (
            <div key={distance}>
              <b>{distance}</b>: {size}
            </div>
          ))}
        </div>
        <div className="flex flex-row gap-4">
          <button className="btn btn-neutral btn-sm" onClick={() => saveToFile()}>
            Save to file
          </button>
          <button className="btn btn-neutral btn-sm" onClick={() => loadFromFile()}>
            Load from file
          </button>
          <button className="btn btn-neutral btn-sm" onClick={() => loadAndMerge()}>
            Load & merge
          </button>
        </div>
        <button
          onClick={handleRecalculateFollowDistances}
          className="btn btn-neutral btn-sm"
        >
          Recalculate Follow Distances (fast, no bandwith usage)
        </button>
        {/* <button className="btn btn-neutral btn-sm" onClick={() => downloadLargeGraph()}>
          Download pre-crawled large graph (38.6 MB, relatively fast and light)
        </button> */}
        <button
          onClick={() => getFollowLists(socialGraph().getRoot(), false, 2)}
          className="btn btn-neutral btn-sm"
        >
          Recrawl follow lists (slow, bandwidth intensive)
        </button>
      </div>
    </div>
  )
}

export default SocialGraphSettings
