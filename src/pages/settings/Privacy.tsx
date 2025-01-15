import {useLocalState} from "irisdb-hooks"
import {ChangeEvent} from "react"

function PrivacySettings() {
  const [enableAnalytics, setEnableAnalytics] = useLocalState(
    "settings/enableAnalytics",
    true,
    Boolean
  )

  function handleEnableAnalyticsChange(e: ChangeEvent<HTMLInputElement>) {
    setEnableAnalytics(e.target.checked)
  }

  return (
    <div>
      <h1 className="text-2xl mb-4">Privacy</h1>
      <div className="flex flex-col gap-4">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="checkbox checkbox-primary mr-2"
              checked={enableAnalytics}
              onChange={handleEnableAnalyticsChange}
            />
            <span>Allow anonymous usage statistics collection</span>
          </label>
        </div>
      </div>
    </div>
  )
}

export default PrivacySettings
