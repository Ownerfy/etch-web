/* eslint-disable @typescript-eslint/no-explicit-any  */
import {Component, FormEvent} from "react"

import ReservedAccount from "./ReservedAccount"
import {profileCache} from "@/utils/memcache"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import ActiveAccount from "./ActiveAccount"
import AccountName from "./AccountName"
import {localState} from "irisdb"
import {ndk} from "irisdb-nostr"

declare global {
  interface Window {
    cf_turnstile_callback: any
  }
}

// TODO split into smaller components
class IrisAccount extends Component {
  state = {
    irisToActive: false,
    existing: null as any,
    profile: null as any,
    newUserName: "",
    newUserNameValid: false,
    error: null as any,
    showChallenge: false,
    invalidUsernameMessage: null as any,
  }

  render() {
    let view: any

    if (this.state.irisToActive) {
      const username = this.state.profile?.nip05.split("@")[0]
      view = <AccountName name={username} />
    } else if (this.state.existing && this.state.existing.confirmed) {
      view = (
        <ActiveAccount
          name={this.state.existing.name}
          setAsPrimary={() => this.setState({irisToActive: true})}
        />
      )
    } else if (this.state.existing) {
      view = (
        <ReservedAccount
          name={this.state.existing.name}
          enableReserved={() => this.enableReserved()}
          declineReserved={() => this.declineReserved()}
        />
      )
    } else if (this.state.error) {
      view = <div className="error">Error: {this.state.error}</div>
    } else if (this.state.showChallenge) {
      window.cf_turnstile_callback = (token: any) => this.register(token)
      view = (
        <>
          <div
            className="cf-turnstile"
            data-sitekey={
              ["etch.social", "beta.etch.social", "snort.social"].includes(
                window.location.hostname
              )
                ? "0x4AAAAAAACsEd8XuwpPTFwz"
                : "3x00000000000000000000FF"
            }
            data-callback="cf_turnstile_callback"
          ></div>
        </>
      )
    } else {
      view = (
        <div>
          <p>Register an Etch username (etch.social/username)</p>
          <form className="flex flex-col gap-4" onSubmit={(e) => this.showChallenge(e)}>
            <div className="flex flex-row gap-4">
              <input
                className="input input-bordered"
                type="text"
                placeholder="Username"
                value={this.state.newUserName}
                onInput={(e) => this.onNewUserNameChange(e)}
              />
              <button className="btn btn-primary" type="submit">
                Register
              </button>
            </div>
            <div>
              {this.state.newUserNameValid ? (
                <>
                  <span className="success">Username is available</span>
                  <AccountName name={this.state.newUserName} link={false} />
                </>
              ) : (
                <span className="error">{this.state.invalidUsernameMessage}</span>
              )}
            </div>
          </form>
        </div>
      )
    }

    return (
      <>
        {view}
        <p>
          <a href="https://etch.social">Etch.social</a>
        </p>
      </>
    )
  }

  async onNewUserNameChange(e: any) {
    const newUserName = e.target.value
    if (newUserName.length === 0) {
      this.setState({
        newUserName,
        newUserNameValid: false,
        invalidUsernameMessage: "",
      })
      return
    }

    if (newUserName.length < 8 || newUserName.length > 15) {
      this.setState({
        newUserName,
        newUserNameValid: false,
        invalidUsernameMessage: "Name must be between 8 and 15 characters",
      })
      return
    }
    if (!newUserName.match(/^[a-z0-9_.]+$/)) {
      this.setState({
        newUserName,
        newUserNameValid: false,
        invalidUsernameMessage:
          "Username must only contain lowercase letters and numbers",
      })
      return
    }
    this.setState({
      newUserName,
      invalidUsernameMessage: "",
    })
    this.checkAvailabilityFromAPI(newUserName)
  }

  checkAvailabilityFromAPI = async (name: string) => {
    const res = await fetch(
      `https://api.iris.to/user/available?name=${encodeURIComponent(name)}`
    )
    if (name !== this.state.newUserName) {
      return
    }
    if (res.status < 500) {
      const json = await res.json()
      if (json.available) {
        this.setState({newUserNameValid: true})
      } else {
        this.setState({
          newUserNameValid: false,
          invalidUsernameMessage: json.message,
        })
      }
    } else {
      this.setState({
        newUserNameValid: false,
        invalidUsernameMessage: "Error checking username availability",
      })
    }
  }

  showChallenge(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!this.state.newUserNameValid) {
      return
    }
    this.setState({showChallenge: true}, () => {
      // Dynamically injecting Cloudflare script
      if (
        !document.querySelector(
          'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
        )
      ) {
        const script = document.createElement("script")
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"
        script.async = true
        script.defer = true
        document.body.appendChild(script)
      }
    })
  }

  async register(cfToken: any) {
    console.log("register", cfToken)
    const event = new NDKEvent(ndk())
    event.kind = 1
    event.content = `iris.to/${this.state.newUserName}`
    await event.sign()
    // post signed event as request body to https://api.iris.to/user/confirm_user
    const res = await fetch("https://api.iris.to/user/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({event: await event.toNostrEvent(), cfToken}),
    })
    if (res.status === 200) {
      this.setState({
        error: null,
        existing: {
          confirmed: true,
          name: this.state.newUserName,
        },
      })
      delete window.cf_turnstile_callback
    } else {
      res
        .json()
        .then((json) => {
          this.setState({error: json.message || "error"})
        })
        .catch(() => {
          this.setState({error: "error"})
        })
    }
  }

  async enableReserved() {
    const event = new NDKEvent(ndk())
    event.kind = 1
    event.content = `iris.to/${this.state.newUserName}`
    await event.sign()
    // post signed event as request body to https://api.iris.to/user/confirm_user
    const res = await fetch("https://api.iris.to/user/confirm_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event.toNostrEvent()),
    })
    if (res.status === 200) {
      this.setState({
        error: null,
        existing: {confirmed: true, name: this.state.existing.name},
      })
    } else {
      res
        .json()
        .then((json) => {
          this.setState({error: json.message || "error"})
        })
        .catch(() => {
          this.setState({error: "error"})
        })
    }
  }

  async declineReserved() {
    if (
      !window.confirm(
        `Are you sure you want to decline iris.to/${this.state.newUserName}?`
      )
    ) {
      return
    }
    const event = new NDKEvent(ndk())
    event.kind = 1
    event.content = `decline iris.to/${this.state.newUserName}`
    await event.sign()
    const res = await fetch("https://api.iris.to/user/decline_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event.toNostrEvent()),
    })
    if (res.status === 200) {
      this.setState({confirmSuccess: false, error: null, existing: null})
    } else {
      res
        .json()
        .then((json) => {
          this.setState({error: json.message || "error"})
        })
        .catch(() => {
          this.setState({error: "error"})
        })
    }
  }

  componentDidMount() {
    localState.get("user/publicKey").on((myPub) => {
      if (myPub && typeof myPub === "string") {
        const profile = profileCache.get(myPub) || {}
        const irisToActive =
          profile && profile.nip05 && profile.nip05.endsWith("@iris.to")
        this.setState({profile, irisToActive})
        if (profile && !irisToActive) {
          this.checkExistingAccount(myPub)
        }
      }

      this.checkExistingAccount(myPub)
    })
  }

  async checkExistingAccount(pub: any) {
    const res = await fetch(`https://api.iris.to/user/find?public_key=${pub}`)
    if (res.status === 200) {
      const json = await res.json()
      this.setState({existing: json})
    }
  }
}

export default IrisAccount
