/* eslint-disable @typescript-eslint/no-explicit-any  */
import {sendEmailVerification} from "firebase/auth"
import {auth} from "@/shared/services/firebase"
import {profileCache} from "@/utils/memcache"
import AccountName from "./AccountName"
import {localState} from "irisdb"
import {Component} from "react"

declare global {
  interface Window {
    cf_turnstile_callback: any
  }
}

// TODO split into smaller components
class IrisAccount extends Component {
  state = {
    etchSocialActive: false,
    existing: null as any,
    profile: null as any,
    newUserName: "",
    newUserNameValid: false,
    error: null as any,
    showChallenge: false,
    invalidUsernameMessage: null as any,
    privateKey: null as string | null,
    showPrivateKey: false,
  }

  private hideKeyTimeout: NodeJS.Timeout | null = null

  render() {
    const username = this.state.profile?.nip05.split("@")[0]

    return (
      <>
        <AccountName name={username} />
        <div className="mt-4">
          <button
            className="btn btn-warning"
            onClick={() => {
              if (this.state.showPrivateKey) {
                // If key is shown, hide it and clear timeout
                if (this.hideKeyTimeout) {
                  clearTimeout(this.hideKeyTimeout)
                }
                this.setState({showPrivateKey: false})
              } else {
                // If key is hidden, show it
                this.showPrivateKey()
              }
            }}
          >
            {this.state.showPrivateKey ? "Hide" : "Show"} Private Key
          </button>
          {this.state.showPrivateKey && this.state.privateKey && (
            <div className="mt-2 p-4 bg-base-200 rounded-lg break-all">
              <p className="text-warning mb-2">
                ⚠️ Never share your private key with anyone!
              </p>
              <code>{this.state.privateKey}</code>
            </div>
          )}

          <p>
            Your etch username is {this.state.profile?.nip05?.split("@")[0]}. On other
            nostr compatible apps you can be found with {this.state.profile?.nip05}. This
            not an email!
          </p>
        </div>
        {auth.currentUser && !auth.currentUser.emailVerified && (
          <button
            className="btn btn-primary mt-2"
            onClick={() => this.resendVerificationEmail()}
          >
            Resend Verification Email
          </button>
        )}
      </>
    )
  }

  async showPrivateKey() {
    // Clear any existing timeout
    if (this.hideKeyTimeout) {
      clearTimeout(this.hideKeyTimeout)
    }

    // Get private key from localState
    localState.get("user/privateKey").once((privKey: string | undefined) => {
      this.setState({privateKey: privKey, showPrivateKey: true})

      // Set timeout to hide after 30 seconds
      this.hideKeyTimeout = setTimeout(() => {
        this.setState({showPrivateKey: false})
      }, 30000)
    })
  }

  async resendVerificationEmail() {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("No user is currently signed in")
      }
      await sendEmailVerification(user)
      alert("Verification email has been sent!")
    } catch (error) {
      console.error("Error resending verification email:", error)
      alert("Failed to resend verification email. Please try again later.")
    }
  }

  componentDidMount() {
    localState.get("user/publicKey").on((myPub) => {
      if (myPub && typeof myPub === "string") {
        const profile = profileCache.get(myPub) || {}
        const etchSocialActive =
          profile && profile.nip05 && profile.nip05.endsWith("@etch.social")
        this.setState({profile, etchSocialActive})
        if (profile && !etchSocialActive) {
          this.checkExistingAccount(myPub)
        }
      }
    })
  }

  async checkExistingAccount(pub: any) {
    const res = await fetch(`https://api.etch.social/user/find?public_key=${pub}`)
    if (res.status === 200) {
      const json = await res.json()
      this.setState({existing: json})
    }
  }

  componentWillUnmount() {
    if (this.hideKeyTimeout) {
      clearTimeout(this.hideKeyTimeout)
    }
  }
}

export default IrisAccount
