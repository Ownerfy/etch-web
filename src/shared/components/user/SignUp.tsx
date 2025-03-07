import {ChangeEvent, FormEvent, useEffect, useRef, useState} from "react"
import {NDKEvent, NDKPrivateKeySigner} from "@nostr-dev-kit/ndk"
import {createUser} from "@/shared/services/BackendServices"
import Icon from "@/shared/components/Icons/Icon"
import ReCAPTCHA from "react-google-recaptcha"
import {useLocalState} from "irisdb-hooks"
import {nip19} from "nostr-tools"
import {localState} from "irisdb"
import {ndk} from "irisdb-nostr"
import axios from "axios"

function toHexString(byteArray: Uint8Array) {
  return Array.from(byteArray, function (byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2)
  }).join("")
}

interface SignUpProps {
  onClose: () => void
}

export default function SignUp({onClose}: SignUpProps) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nameError, setNameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false)
  const [, setShowLoginDialog] = useLocalState("home/showLoginDialog", false)
  const [, setShowWelcomeDialog] = useLocalState("home/showWelcomeDialog", false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true)
  const [hasNostrKey, setHasNostrKey] = useState(false)
  const [nostrKey, setNostrKey] = useState("")
  const [translatedNostrKey, setTranslatedNostrKey] = useState("")
  const [nostrKeyError, setNostrKeyError] = useState("")
  const [bskyDid] = useLocalState("bsky/did", "")
  const [bskyDescription] = useLocalState("bsky/description", "")
  const [bskyHandle] = useLocalState("bsky/handle", "")
  const [bskyAvatar] = useLocalState("bsky/avatar", "")
  const [bskyToken] = useLocalState("bsky/token", "")
  const [isBskyLoading, setIsBskyLoading] = useState(false)
  const [bskyHandleInput, setBskyHandleInput] = useState("")
  const [bskyHandleError, setBskyHandleError] = useState("")

  useEffect(() => {
    if (inputRef.current && !bskyDid) {
      inputRef.current.focus()
    }
  }, [inputRef.current, bskyDid])

  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (username) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_FUNCTIONS_URL}api/checkUsernameDuplication/${username}`
          )

          if (response.data.duplicated) {
            setIsUsernameAvailable(false)
            setNameError("Username is already taken.")
          } else {
            setIsUsernameAvailable(true)
            setNameError("")
          }
        } catch (error) {
          console.error("Error checking username availability", error)
        }
      }
    }

    const debounceTimeout = setTimeout(() => {
      checkUsernameAvailability()
    }, 2000)

    return () => clearTimeout(debounceTimeout)
  }, [username])

  useEffect(() => {
    if (bskyHandle) {
      const handle = bskyHandle.replace(".bsky.social", "").trim()
      setUsername(handle)
    }
  }, [bskyHandle])

  function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    setUsername(e.target.value)
  }

  function validateEmail(email: string) {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError("Invalid email format.")
    } else {
      setEmailError("")
    }
  }

  function validatePassword(password: string, confirmPassword: string) {
    if (password.length < 10) {
      setPasswordError(
        "Password must be at least 10 characters long. Short sentences make great passwords."
      )
    } else if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.")
    } else {
      setPasswordError("")
    }
  }

  function onEmailChange(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value)
  }

  function onPasswordChange(e: ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value)
  }

  function onConfirmPasswordChange(e: ChangeEvent<HTMLInputElement>) {
    setConfirmPassword(e.target.value)
  }

  function onEmailBlur() {
    validateEmail(email)
  }

  function onConfirmPasswordBlur() {
    validatePassword(password, confirmPassword)
  }

  const verifyCaptcha = (res: string | null) => {
    setCaptchaToken(res)
  }

  const expireCaptcha = () => {
    setCaptchaToken(null)
  }

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked)
  }

  const handleAgeCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsAgeConfirmed(e.target.checked)
  }

  const validateAndConvertNostrKey = (key: string): string | null => {
    if (/^[0-9a-fA-F]{64}$/.test(key)) {
      return key.toLowerCase()
    }
    if (key.startsWith("nsec")) {
      try {
        const {data} = nip19.decode(key)
        const hexKey = toHexString(data as Uint8Array)
        return hexKey.toLowerCase()
      } catch (error) {
        console.warn("Key conversion error: ", error)
        return null
      }
    }

    return null
  }

  const handleNostrKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (value) {
      const validKey = validateAndConvertNostrKey(value)
      if (!validKey) {
        setNostrKeyError("Invalid private key format. Please use hex or nsec format.")
      } else {
        setNostrKey(value)
        setTranslatedNostrKey(validKey)
        setNostrKeyError("")
      }
    } else {
      setNostrKeyError("")
    }
  }

  const formatBskyHandle = (handle: string): string => {
    const cleanHandle = handle.replace(".bsky.social", "").trim()
    return cleanHandle ? `${cleanHandle}.bsky.social` : ""
  }

  const handleBskyLogin = async () => {
    if (!bskyHandleInput.trim()) {
      setBskyHandleError("Please enter your Bluesky handle")
      return
    }

    setIsBskyLoading(true)
    setBskyHandleError("")

    try {
      const formattedHandle = formatBskyHandle(bskyHandleInput)
      const response = await axios.get(
        `${import.meta.env.VITE_FUNCTIONS_URL}api/bsky/oauth/login`,
        {params: {handle: formattedHandle}}
      )
      window.location.href = response.data.url
    } catch (error) {
      console.error("Failed to initiate BlueSky login:", error)
      setSubmitError("Failed to connect with BlueSky. Please try again.")
      setIsBskyLoading(false)
    }
  }

  async function onNewUserLogin(e: FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setSubmitError("")

    let valid = true
    if (username.length < 4) {
      setNameError("Username must be at least 4 characters long.")
      valid = false
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setNameError("Username can only contain letters, numbers and underscores.")
      valid = false
    } else if (!isUsernameAvailable) {
      setNameError("Username is already taken.")
      valid = false
    } else {
      setNameError("")
    }

    validateEmail(email)
    validatePassword(password, confirmPassword)

    if (emailError || passwordError) {
      valid = false
    }

    if (hasNostrKey) {
      if (!nostrKey) {
        setNostrKeyError("Private key is required when checkbox is checked")
        valid = false
      } else {
        const validKey = validateAndConvertNostrKey(nostrKey)
        if (!validKey) {
          setNostrKeyError("Invalid private key format")
          valid = false
        }
      }
    }

    if (valid && username && email && password) {
      try {
        ndk()

        const {privKey, nostrPubKey} = await createUser({
          username: username,
          email: email.toLowerCase().trim(),
          password,
          captchaToken,
          nostrKey: hasNostrKey ? translatedNostrKey : null,
          bskyToken: bskyToken || null,
        })

        localState.get("user/privateKey").put(privKey)
        localState.get("user/publicKey").put(nostrPubKey)
        const privateKeySigner = new NDKPrivateKeySigner(privKey)
        ndk().signer = privateKeySigner
        const profileEvent = new NDKEvent(ndk())
        profileEvent.kind = 0

        profileEvent.content = JSON.stringify({
          display_name: username,
          nip05: `${username}@etch.social`,
          picture: bskyAvatar,
          about: bskyDescription,
        })

        profileEvent.publish()
        setShowLoginDialog(false)
        setShowWelcomeDialog(true)
      } catch (error: unknown) {
        if (error instanceof Error) {
          setSubmitError(`An error occurred: ${error.message}`)
        } else {
          setSubmitError("An error occured. Try again or contact support.")
        }
      }
    }

    setIsLoading(false)
  }

  const getButtonText = () => {
    if (bskyDid) return "Success! Complete signup below"
    if (isBskyLoading) return "Loading..."
    return "Connect with BlueSky"
  }

  return (
    <div className="flex flex-col gap-4 ">
      <form
        className="flex flex-col items-center gap-4 flex-wrap"
        onSubmit={(e) => onNewUserLogin(e)}
      >
        <h1 className="text-2xl font-bold">Sign up</h1>

        <button
          type="button"
          onClick={handleBskyLogin}
          className={`btn gap-2 w-[300px] ${bskyDid || isBskyLoading ? "btn-disabled" : "btn-outline"}`}
          disabled={!!bskyDid || isBskyLoading}
        >
          <Icon name="bluesky" size={24} />
          {getButtonText()}
        </button>
        <input
          className="input input-bordered w-[300px]"
          type="text"
          placeholder={bskyDid ? "Your Etch handle can be different" : "BlueSky handle"}
          value={bskyHandleInput}
          onChange={(e) => setBskyHandleInput(e.target.value)}
          disabled={!!bskyDid || isBskyLoading}
        />
        {bskyHandleError && <p className="text-red-500">{bskyHandleError}</p>}
        {!bskyDid && <div className="divider">OR</div>}
        <input
          ref={inputRef}
          autoComplete="Username"
          autoFocus
          className="input input-bordered w-[300px]"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => onNameChange(e)}
        />
        {nameError && <p className="text-red-500">{nameError}</p>}
        <input
          autoComplete="email"
          className="input input-bordered w-[300px]"
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => onEmailChange(e)}
          onBlur={onEmailBlur}
        />
        {emailError && <p className="text-red-500">{emailError}</p>}
        <input
          className="input input-bordered w-[300px]"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => onPasswordChange(e)}
        />
        <input
          className="input input-bordered w-[300px]"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e)}
          onBlur={onConfirmPasswordBlur}
        />
        {passwordError && <p className="text-red-500">{passwordError}</p>}
        <div>
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_GOOGLE_CAPTCHA_SITE_KEY}
            onChange={verifyCaptcha}
            onExpired={expireCaptcha}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
            className="checkbox"
          />
          <label className="text-sm">
            I agree to the{" "}
            <a href="/terms" className="text-blue-500 underline">
              TOS
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-blue-500 underline">
              Privacy Policy
            </a>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isAgeConfirmed}
            onChange={handleAgeCheckboxChange}
            className="checkbox"
          />
          <label className="text-sm">I confirm that I am 18 years of age or older</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={hasNostrKey}
            onChange={(e) => setHasNostrKey(e.target.checked)}
            className="checkbox"
          />
          <label className="text-sm">I have a Nostr private key</label>
        </div>
        {hasNostrKey && (
          <>
            <input
              className="input input-bordered w-[300px]"
              type="text"
              placeholder="Enter your Nostr private key"
              value={nostrKey}
              onChange={handleNostrKeyChange}
            />
            {nostrKeyError && <p className="text-red-500">{nostrKeyError}</p>}
          </>
        )}
        <button
          className="btn btn-primary"
          type="submit"
          disabled={isLoading || !isChecked || !isAgeConfirmed}
        >
          {isLoading ? "Loading..." : "Complete"}
        </button>
        {submitError && <p className="text-red-500">{submitError}</p>}
      </form>

      <div
        className="flex flex-col items-center justify-center gap-4 flex-wrap border-t pt-4 cursor-pointer"
        onClick={onClose}
      >
        <span className="hover:underline">Already have an account?</span>
        <button className="btn btn-sm btn-neutral">Sign in</button>
      </div>
    </div>
  )
}
