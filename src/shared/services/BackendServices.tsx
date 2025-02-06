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
  await signInWithEmailAndPassword(auth, email, password)

  // Get user data from backend
  const {
    data: {privKey, nostrPubKey},
  } = await axios.get(`${import.meta.env.VITE_FUNCTIONS_URL}api/getUser`)

  return {privKey, nostrPubKey}
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

// Publish note
const publishNote = async ({
  title,
  content,
  uploadedVideo,
  isNft,
  uploadedImages,
  repliedEvent,
  quotedEvent,
  generatedImageUrl,
}: {
  title: string
  content: string
  uploadedVideo: string | null
  isNft: boolean
  uploadedImages: string[]
  repliedEvent: string | null
  quotedEvent: string | null
  generatedImageUrl: string | null
}) => {
  const response = await axios.post(
    `${import.meta.env.VITE_FUNCTIONS_URL}api/social/post`,
    {
      title,
      content,
      uploadedVideo,
      isNft,
      uploadedImages,
      repliedEvent,
      quotedEvent,
      generatedImageUrl,
    }
  )
  return response.data
}

export {publishNote}

const createStripeCheckoutSessionForBuyCredits = async (data: {
  creditPlanId: string
  cancelUrl: string
  successUrl: string
}) => {
  const stripeCheckoutData = await axios.post(
    `/api/createStripeCheckoutSessionForCredits`,
    data
  )
  return stripeCheckoutData.data
}

export {createStripeCheckoutSessionForBuyCredits}

const getCreditPlans = async () => {
  try {
    const response = await axios.get(`api/credit-plans`)
    return response.data
  } catch (error) {
    console.error(`Fetch Credit Plans Failed: `, error)
    return []
  }
}

export {getCreditPlans}

const fetchUserCredits = async () => {
  try {
    const response = await axios.get(`api/user-credits`)
    return response.data
  } catch (error) {
    console.error("Get Credit Failed: ", error)
  }
}

export {fetchUserCredits}
