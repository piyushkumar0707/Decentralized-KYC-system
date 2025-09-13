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
  async verifyUser(address, message, signature) {
    const response = await api.post("/api/user/verify", {
      address,
      message,
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
    const response = await api.get(`/api/did/getUser?userId=${userId}`)
    return response.data
  },

  async revokeDID(userId, reason) {
    const response = await api.post("/api/did/revoke", { userId, reason })
    return response.data
  },

  async updatePrivacy(userId, privacySettings) {
    const response = await api.post("/api/did/updatePrivacy", {
      userId,
      privacySettings,
    })
    return response.data
  },

  // User Management
  async getAllUsers() {
    const response = await api.get("/api/users")
    return response.data
  },

  async getAuditLogs(userId) {
    const response = await api.get(`/api/audit-logs?userId=${userId}`)
    return response.data
  },
}

export default api
