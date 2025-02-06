import {ChangeEvent, FormEvent, useEffect, useRef, useState} from "react"
import {NDKEvent, NDKPrivateKeySigner} from "@nostr-dev-kit/ndk"
import {createUser} from "@/shared/services/BackendServices"
import ReCAPTCHA from "react-google-recaptcha"
import {useLocalState} from "irisdb-hooks"
import {localState} from "irisdb"
import {ndk} from "irisdb-nostr"
import axios from "axios"

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

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [inputRef.current])

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

    if (valid && username && email && password) {
      try {
        ndk()

        const {privKey, nostrPubKey} = await createUser({
          username: username,
          email: email.toLowerCase().trim(),
          password,
          captchaToken,
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

  return (
    <div className="flex flex-col gap-4 ">
      <form
        className="flex flex-col items-center gap-4 flex-wrap"
        onSubmit={(e) => onNewUserLogin(e)}
      >
        <h1 className="text-2xl font-bold">Sign up</h1>
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
        <button
          className="btn btn-primary"
          type="submit"
          disabled={isLoading || !isChecked || !isAgeConfirmed}
        >
          {isLoading ? "Loading..." : "Go"}
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
