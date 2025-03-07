// import BskySignUp from "@/shared/components/user/BskySignUp"
import SignUp from "@/shared/components/user/SignUp"
import SignIn from "@/shared/components/user/SignIn"
// import {useLocalState} from "irisdb-hooks"
import {useState} from "react"

export default function LoginDialog() {
  const [showSignIn, setShowSignIn] = useState(!!window.nostr)
  // const [bskyDid] = useLocalState("bsky/did", "")

  const getAuthComponent = () => {
    // if (bskyDid) return <BskySignUp />
    if (showSignIn) return <SignIn onClose={() => setShowSignIn(false)} />
    return <SignUp onClose={() => setShowSignIn(true)} />
  }

  return (
    <div className="flex flex-row items-center gap-2 justify-between card card-compact">
      <div className="card-body items-center">
        <img src={CONFIG.navLogo} alt={CONFIG.appName} className="w-12 h-12" />
        {getAuthComponent()}
      </div>
    </div>
  )
}
