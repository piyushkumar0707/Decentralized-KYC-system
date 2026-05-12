import axios from "axios"
import { AuthService } from "./auth.js"

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = AuthService.getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AuthService.removeToken()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export const apiService = {
  // Authentication
  async getNonce(address) {
    const response = await api.post("/api/user/nonce", { address })
    return response.data
  },

  async verifyUser(address, signature) {
    const response = await api.post("/api/user/verify", {
      address,
      signature,
    })
    return response.data
  },

  // DID Management
  async registerDID(userId) {
    const response = await api.post("/api/did/register", { userId })
    return response.data
  },

  async getUserDID(userId) {
    const query = (userId && userId !== "user123") ? `?userId=${userId}` : ""
    const response = await api.get(`/api/did/user${query}`)
    return response.data.data
  },

  async revokeDID(userId, reason) {
    const response = await api.post("/api/did/revoke", { userId, reason })
    return response.data
  },

  async updatePrivacy(userId, privacySettings) {
    const payload = { privacySettings }
    if (userId && userId !== "user123") payload.userId = userId
    const response = await api.post("/api/did/updatePrivacy", payload)
    return response.data
  },

  // User Management
  async getAllUsers() {
    const response = await api.get("/api/user")
    return response.data.data
  },

  async getAuditLogs(userId) {
    const query = (userId && userId !== "user123") ? `?userId=${userId}` : ""
    const response = await api.get(`/api/audit/list${query}`)
    return response.data.data
  },
}

export default api