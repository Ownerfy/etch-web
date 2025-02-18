import {useLocalState} from "irisdb-hooks"

function Content() {
  const [blurNSFW, setBlurNSFW] = useLocalState<boolean>("settings/blurNSFW", false)
  const [hideEventsByUnknownUsers, setHideEventsByUnknownUsers] = useLocalState<boolean>(
    "settings/hideEventsByUnknownUsers",
    false
  )
  const [youtubePrivacyMode, setYoutubePrivacyMode] = useLocalState(
    "settings/youtubePrivacyMode",
    CONFIG.defaultSettings.youtubePrivacyMode
  )

  const handleToggleChange = (setter: (value: boolean) => void, value: boolean) => {
    setter(!value)
  }

  return (
    <div>
      <h1 className="text-2xl mb-4">Content</h1>
      <div className="space-y-4">
        <SettingToggle
          checked={hideEventsByUnknownUsers}
          onChange={() =>
            handleToggleChange(setHideEventsByUnknownUsers, hideEventsByUnknownUsers)
          }
          label="Hide posts by unknown users"
        />
        <SettingToggle
          checked={blurNSFW}
          onChange={() => handleToggleChange(setBlurNSFW, blurNSFW)}
          label="Blur NSFW Media"
        />
        <SettingToggle
          checked={youtubePrivacyMode}
          onChange={() => handleToggleChange(setYoutubePrivacyMode, youtubePrivacyMode)}
          label="Replace Youtube links with an invidious instance for better privacy"
        />
      </div>
    </div>
  )
}

interface SettingToggleProps {
  checked: boolean
  onChange: () => void
  label: string
}

function SettingToggle({checked, onChange, label}: SettingToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="toggle toggle-primary"
      />
      <span>{label}</span>
    </div>
  )
}

export default Content
