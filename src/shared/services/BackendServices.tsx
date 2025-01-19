// Exported functions that can be called to insteract with the firebase backend. This includes functions calls using the functions URL for this project.
// Create a firebase user
import {
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth"
import axios from "@/shared/services/AxiosWithAuth"
import {auth} from "@/shared/services/firebase.tsx"

const createUser = async ({
  email,
  username,
  password,
  captchaToken,
}: {
  email: string
  username: string
  password: string
  captchaToken: string | null
}) => {
  const result = await createUserWithEmailAndPassword(auth, email, password)

  const {user} = result
  try {
    await sendEmailVerification(user)
  } catch (error) {
    console.error("Failed to send email verification", error)
  }

  const {uid} = user
  const payload = {username, email, uid, captchaToken}
  const response = await axios.post(
    `${import.meta.env.VITE_FUNCTIONS_URL}api/newUser`,
    payload
  )
  return response.data
}

export {createUser}

// Sign in a firebase user
const signIn = async ({email, password}: {email: string; password: string}) => {
  const result = await signInWithEmailAndPassword(auth, email, password)
  console.log("sign in firebase user result: ", result)
  return result
}

export {signIn}

// Sign out a firebase user
const signOutUser = async () => {
  await signOut(auth)
}

export {signOutUser}

// Send password reset email
const sendPasswordReset = async (email: string) => {
  await sendPasswordResetEmail(auth, email)
}

export {sendPasswordReset}
