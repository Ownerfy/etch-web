import {auth} from "@/shared/services/firebase.tsx"
import axios from "axios"

const instance = axios.create({baseURL: import.meta.env.VITE_FUNCTIONS_URL})

instance.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser

    if (user) {
      const authToken = await user.getIdToken()
      config.headers["Authorization"] = `Bearer ${authToken}`
    }

    return config
  },
  (error) => {
    Promise.reject(error)
  }
)

export default instance
