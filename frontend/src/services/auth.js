// MetaMask authentication service
export class AuthService {
    static async connectWallet() {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed")
      }
  
      try {
        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })
  
        return accounts[0]
      } catch (error) {
        throw new Error("Failed to connect wallet: " + error.message)
      }
    }
  
    static async signMessage(address, message) {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed")
      }
  
      try {
        const signature = await window.ethereum.request({
          method: "personal_sign",
          params: [message, address],
        })
  
        return signature
      } catch (error) {
        throw new Error("Failed to sign message: " + error.message)
      }
    }
  
    static async authenticateUser(address) {
      try {
        // Generate a message to sign
        const message = `Sign this message to authenticate with DID KYC system: ${Date.now()}`
  
        // Sign the message
        const signature = await this.signMessage(address, message)
  
        return { address, message, signature }
      } catch (error) {
        throw new Error("Authentication failed: " + error.message)
      }
    }
  
    static getStoredToken() {
      return localStorage.getItem("did_kyc_token")
    }
  
    static setToken(token) {
      localStorage.setItem("did_kyc_token", token)
    }
  
    static removeToken() {
      localStorage.removeItem("did_kyc_token")
    }
  
    static isAuthenticated() {
      return !!this.getStoredToken()
    }
  }
  