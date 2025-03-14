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
  nostrKey,
  bskyToken,
}: {
  email: string
  username: string
  password: string
  captchaToken: string | null
  nostrKey: string | null
  bskyToken: string | null
}) => {
  const result = await createUserWithEmailAndPassword(auth, email, password)

  const {user} = result
  try {
    await sendEmailVerification(user)
  } catch (error) {
    console.error("Failed to send email verification", error)
  }

  const {uid} = user
  const payload = {
    username,
    email,
    uid,
    captchaToken,
    nostrKey,
    bskyToken,
  }
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
    data: {privKey, nostrPubKey, bskyData},
  } = await axios.get(`${import.meta.env.VITE_FUNCTIONS_URL}api/getUser`)

  return {privKey, nostrPubKey, bskyData}
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
  addLinkBack,
  publishOnBlueSky,
  bskyReplyUri,
  bskyReplyCid,
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
  publishOnBlueSky: boolean
  bskyReplyUri: string | null
  bskyReplyCid: string | null
  addLinkBack: boolean
}) => {
  const response = await axios.post(
    `${import.meta.env.VITE_FUNCTIONS_URL}api/social/post`,
    {
      title,
      content,
      uploadedVideo,
      isNft,
      publishOnBlueSky,
      bskyReplyUri,
      bskyReplyCid,
      addLinkBack,
      uploadedImages,
      repliedEvent,
      quotedEvent,
      generatedImageUrl,
    }
  )
  // if status is not 200, throw an error
  if (response.status !== 200) {
    throw new Error(response.data.message)
  }
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

const bskyAuthLogin = async (handle: string, redirectUrl: string) => {
  const response = await axios.get(`api/bsky/oauth/authLogin`, {
    params: {handle, redirectUrl},
  })
  return response.data
}

export {bskyAuthLogin}

const getBskyTimeline = async (cursor: string | null) => {
  const response = await axios.get(`api/social/bsky/timeline`, {
    params: {cursor},
  })
  console.log("Bsky Timeline Response:::   ", response.data)
  return response.data
}

export {getBskyTimeline}

const getBskyPostThread = async (postId: string) => {
  const response = await axios.get(`api/social/bsky/thread`, {
    params: {uri: postId},
  })
  return response.data
}

export {getBskyPostThread}

const bskyLikePost = async (uri: string, cid: string, like: boolean) => {
  const response = await axios.post(`api/social/bsky/like`, {
    uri,
    cid,
    like, // true to like, false to unlike
  })
  return response.data
}

const bskyRepostPost = async (uri: string, cid: string, repost: boolean) => {
  const response = await axios.post(`api/social/bsky/repost`, {
    uri,
    cid,
    repost, // true to repost, false to unrepost
  })
  return response.data
}

export {bskyLikePost, bskyRepostPost}

const getBskyLatestPosts = async (cursor?: string | null) => {
  try {
    const response = await axios.get(`/api/social/bsky/latest`, {
      params: {
        cursor: cursor || undefined,
      },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching BlueSky latest posts:", error)
    throw error
  }
}

export {getBskyLatestPosts}

const getBskyPopularPosts = async (cursor?: string | null) => {
  try {
    const response = await axios.get(`/api/social/bsky/popular`, {
      params: {
        cursor: cursor || undefined,
      },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching BlueSky popular posts:", error)
    throw error
  }
}

export {getBskyPopularPosts}
