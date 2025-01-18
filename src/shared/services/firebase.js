import {getAuth, connectAuthEmulator} from "firebase/auth"
import {getAnalytics} from "firebase/analytics"
import {initializeApp} from "firebase/app"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)

const auth = getAuth(app)

if (import.meta.env.VITE_APP_EMULATOR_AUTH === "true") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099")
}

export {auth, analytics}
