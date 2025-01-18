import {auth} from "@/shared/services/firebase"
import axios from "axios"

const instance = axios.create({baseURL: import.meta.env.VITE_FUNCTIONS_URL})

instance.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser

    console.log("user", user)
    if (user) {
      const authToken = await user.getIdToken()
      console.log("authToken", authToken)
      config.headers["Authorization"] = `Bearer ${authToken}`
    }

    return config
  },
  (error) => {
    Promise.reject(error)
  }
)

export default instance
