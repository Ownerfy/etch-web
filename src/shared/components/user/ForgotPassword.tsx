import {sendPasswordReset} from "@/shared/services/BackendServices"
import React, {useState} from "react"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email) {
      setError("Please enter your email")
      return
    }

    try {
      sendPasswordReset(email)
      setSubmitted(true)
    } catch {
      setError("Error sending password reset link")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-col items-center gap-4 flex-wrap"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <input
          type="email"
          placeholder="Email"
          className="input input-bordered max-w-xs w-[300px]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <p className="text-error text-sm">{error}</p>}
        {submitted ? (
          <p>
            If there is an account associated with this email you will recieve a reset
            link
          </p>
        ) : (
          <button type="submit" className="btn btn-primary">
            Send Reset Link
          </button>
        )}
      </form>
    </div>
  )
}
