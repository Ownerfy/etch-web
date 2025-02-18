import {useEffect, useState} from "react"

function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null
  )

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    })
  }, [])

  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const {outcome} = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setDeferredPrompt(null)
      }
    }
  }

  return (
    <div className="max-full mx-auto p-4 text-left">
      <h1 className="text-3xl font-bold mb-8">Install Etch</h1>

      {/* Quick Install Button */}
      {deferredPrompt && (
        <div className="mb-8 p-6 rounded-lg bg-base-200">
          <h2 className="text-xl font-semibold mb-4 flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Quick Install</span>
          </h2>
          <p className="mb-4">Install Etch on your device for the best experience</p>
          <button onClick={installPWA} className="btn btn-primary">
            Install Now
          </button>
        </div>
      )}

      {/* iOS Installation */}
      <div className="mb-8 p-6 rounded-lg bg-base-200">
        <h2 className="text-xl font-semibold mb-4 flex items-start gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span>Install on iOS</span>
        </h2>
        <ol className="list-decimal ml-4 space-y-2">
          <li>Open Etch in Safari browser</li>
          <li>
            Tap the Share button <span className="inline-block w-6"></span>
          </li>
          <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
          <li>Tap &quot;Add&quot; to install</li>
        </ol>
      </div>

      {/* Android Installation */}
      <div className="mb-8 p-6 rounded-lg bg-base-200">
        <h2 className="text-xl font-semibold mb-4 flex items-start gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <span>Install on Android</span>
        </h2>
        <ol className="list-decimal ml-4 space-y-2">
          <li>Open Chrome browser</li>
          <li>Tap the menu button (three dots) in the top right</li>
          <li>Tap &quot;Install app&quot; or &quot;Add to Home screen&quot;</li>
          <li>Follow the on-screen instructions</li>
        </ol>
      </div>

      {/* Desktop Chrome Installation */}
      <div className="mb-8 p-6 rounded-lg bg-base-200">
        <h2 className="text-xl font-semibold mb-4 flex items-start gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span>Install on Desktop</span>
        </h2>
        <ol className="list-decimal ml-4 space-y-2">
          <li>Open Chrome browser</li>
          <li>Click the menu button (three dots) in the top right</li>
          <li>
            Click &quot;Install Etch...&quot; or look for the install icon in the address
            bar
          </li>
          <li>Click &quot;Install&quot; in the prompt</li>
        </ol>
      </div>

      {/* Benefits Section */}
      <div className="p-6 rounded-lg bg-base-200">
        <h2 className="text-xl font-semibold mb-4 flex items-start gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Benefits</span>
        </h2>
        <ul className="list-disc ml-4 space-y-2">
          <li>Faster access to Etch</li>
          <li>Native app-like experience</li>
          <li>Automatic updates</li>
        </ul>
      </div>
    </div>
  )
}

// Add type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

export default Install
