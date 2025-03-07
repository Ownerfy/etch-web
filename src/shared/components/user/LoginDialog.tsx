import SignUp from "@/shared/components/user/SignUp"
import SignIn from "@/shared/components/user/SignIn"
import {useState} from "react"

interface LoginDialogProps {
  defaultToSignIn?: boolean
}

export default function LoginDialog({
  defaultToSignIn = !!window.nostr,
}: LoginDialogProps) {
  const [showSignIn, setShowSignIn] = useState(defaultToSignIn)

  const getAuthComponent = () => {
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
