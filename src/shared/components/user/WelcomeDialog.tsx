import {useLocalState} from "irisdb-hooks"

export default function WelcomeDialog() {
  const [, setShowWelcomeDialog] = useLocalState("home/showWelcomeDialog", false)

  return (
    <div className="flex flex-row items-center gap-2 justify-between card card-compact">
      <div className="card-body items-center">
        <img src={CONFIG.navLogo} alt={CONFIG.appName} className="w-12 h-12" />

        <h1 className="text-2xl font-bold mb-4 mt-4">Welcome to Etch.Social!</h1>

        <div className="max-w-[400px] text-left">
          <p className="mb-4">
            We’re excited to have you join our growing community. By using Etch.Social,
            you’ll see messages and content from
            <strong> across the Nostr protocol and blockchain networks</strong>, not just
            from our platform alone—opening up a truly global conversation!
          </p>

          <p className="mb-4">Here’s what you can expect as you get started:</p>

          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              <strong>Post for Free</strong>: Feel free to share your thoughts, updates,
              or creative content without any cost.
            </li>
            <li>
              <strong>100 Free Blockchain Credits</strong>: Get started with 100
              complimentary blockchain posts to try out the unique on-chain experience.
            </li>
            <li>
              <strong>More Posting Options</strong>: If you need additional on-chain posts
              or want to support our platform, you can buy more credits or subscribe in
              your settings panel.
            </li>
          </ul>

          <p className="mb-4">
            We’re looking forward to hearing your voice. Jump in, explore, and connect
            with others around the world!
          </p>

          <p className="font-semibold">Welcome again, and happy posting!</p>
        </div>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          onClick={() => setShowWelcomeDialog(false)}
        >
          Close
        </button>
      </div>
    </div>
  )
}
