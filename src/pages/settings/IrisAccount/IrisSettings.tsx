/* eslint-disable @typescript-eslint/no-explicit-any  */
import {bskyAuthLogin} from "@/shared/services/BackendServices"
import {sendEmailVerification} from "firebase/auth"
import Icon from "@/shared/components/Icons/Icon"
import {auth} from "@/shared/services/firebase"
import {profileCache} from "@/utils/memcache"
import {useLocalState} from "irisdb-hooks"
import AccountName from "./AccountName"
import {localState} from "irisdb"
import {Component} from "react"

declare global {
  interface Window {
    cf_turnstile_callback: any
  }
}

interface BlueSkyProps {
  handleInput: string
  handleInputChange: (value: string) => void
  handleLogin: (handle?: string) => void
  isLoading: boolean
  error: string
}

function BlueSkySection({
  handleInput,
  handleInputChange,
  handleLogin,
  isLoading,
  error,
}: BlueSkyProps) {
  const [bskyDid] = useLocalState("bsky/did", "")
  const [bskyHandle] = useLocalState("bsky/handle", "")
  const [bskyAvatar] = useLocalState("bsky/avatar", "")

  if (bskyDid && bskyHandle) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          {bskyAvatar && (
            <img
              src={bskyAvatar}
              alt="BlueSky Profile"
              className="w-12 h-12 rounded-full"
            />
          )}
          <div>
            <p className="font-medium">{bskyHandle}</p>
            <p className="text-sm text-base-content/70">Connected to BlueSky</p>
          </div>
        </div>
        <div>
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="button"
            onClick={() => handleLogin(bskyHandle)}
            className={`btn gap-2 w-[300px] ${isLoading ? "btn-disabled" : "btn-outline"}`}
            disabled={isLoading}
          >
            <Icon name="bluesky" size={24} />
            {isLoading ? "Loading..." : "Refresh BlueSky Auth"}
          </button>
        </div>
        {/* <button
          className="btn btn-warning self-start"
          onClick={() => {
            // Clear BlueSky data
            localState.get("bsky/did").put("")
            localState.get("bsky/handle").put("")
            localState.get("bsky/avatar").put("")
            localState.get("bsky/token").put("")
            localState.get("bsky/description").put("")
          }}
        >
          Disconnect BlueSky
        </button> */}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        className="input input-bordered w-[300px]"
        type="text"
        placeholder="BlueSky handle"
        value={handleInput}
        onChange={(e) => handleInputChange(e.target.value)}
        disabled={isLoading}
      />
      {error && <p className="text-red-500">{error}</p>}
      <button
        type="button"
        onClick={() => handleLogin()}
        className={`btn gap-2 w-[300px] ${isLoading ? "btn-disabled" : "btn-outline"}`}
        disabled={isLoading}
      >
        <Icon name="bluesky" size={24} />
        {isLoading ? "Loading..." : "Connect with BlueSky"}
      </button>
    </div>
  )
}

// TODO split into smaller components
class IrisSettings extends Component {
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
    bskyHandleInput: "",
    bskyHandleError: "",
    isBskyLoading: false,
  }

  private hideKeyTimeout: NodeJS.Timeout | null = null

  render() {
    const username = this.state.profile?.nip05.split("@")[0]

    return (
      <div>
        <h1 className="text-2xl mb-4 mt-8">BlueSky Account</h1>
        <div className="flex flex-col gap-4 prose">
          <BlueSkySection
            handleInput={this.state.bskyHandleInput}
            handleInputChange={this.handleBskyInputChange}
            handleLogin={this.handleBskyLogin}
            isLoading={this.state.isBskyLoading}
            error={this.state.bskyHandleError}
          />
        </div>
        <h1 className="text-2xl mb-4 mt-8">Nostr account</h1>
        <div className="flex flex-col gap-4 prose">
          <div>
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
                nostr compatible apps you can be found with {this.state.profile?.nip05}.
                This not an email!
              </p>
            </div>
            <h1 className="text-2xl mb-4 mt-8">Email</h1>
            {auth.currentUser && !auth.currentUser.emailVerified && (
              <button
                className="btn btn-primary mt-2"
                onClick={() => this.resendVerificationEmail()}
              >
                Resend Verification Email
              </button>
            )}
          </div>
        </div>
      </div>
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

  formatBskyHandle = (handle: string): string => {
    const cleanHandle = handle.replace(".bsky.social", "").trim()
    return cleanHandle ? `${cleanHandle}.bsky.social` : ""
  }

  handleBskyInputChange = (value: string) => {
    this.setState({bskyHandleInput: value})
  }

  handleBskyLogin = async (handle?: string) => {
    if (!handle && !this.state.bskyHandleInput.trim()) {
      this.setState({bskyHandleError: "Please enter your Bluesky handle"})
      return
    }

    const _handle = handle || this.state.bskyHandleInput

    this.setState({isBskyLoading: true, bskyHandleError: ""})

    try {
      const formattedHandle = this.formatBskyHandle(_handle)
      const response = await bskyAuthLogin(formattedHandle, "settings/etch")

      window.location.href = response.url
    } catch (error) {
      console.error("Failed to initiate BlueSky login:", error)
      this.setState({
        bskyHandleError: "Failed to connect with BlueSky. Please try again.",
        isBskyLoading: false,
      })
    }
  }
}

export default IrisSettings
