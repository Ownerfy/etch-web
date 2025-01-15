import {useLocalState} from "irisdb-hooks"
import {ChangeEvent} from "react"

function AppearanceSettings() {
  const [theme, setTheme] = useLocalState("user/theme", CONFIG.defaultTheme, String)

  const [notesTheme, setNotesTheme] = useLocalState(
    "user/notesTheme",
    CONFIG.defaultNotesTheme,
    String
  )

  function handleThemeChange(e: ChangeEvent<HTMLSelectElement>) {
    setTheme(e.target.value)
  }

  function handleNotesThemeChange(e: ChangeEvent<HTMLSelectElement>) {
    setNotesTheme(e.target.value)
  }

  return (
    <div>
      <h1 className="text-2xl mb-4">Appearance</h1>
      <div className="flex flex-col gap-4">
        <div>
          <p>Theme</p>
          <div className="mt-2">
            <select
              className="select select-primary"
              value={theme}
              onChange={handleThemeChange}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="etch">Etch</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
        <div>
          <p>Notes</p>
          <div className="mt-2">
            <select
              className="select select-primary"
              value={notesTheme}
              onChange={handleNotesThemeChange}
            >
              <option value="etch">Etch</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppearanceSettings
