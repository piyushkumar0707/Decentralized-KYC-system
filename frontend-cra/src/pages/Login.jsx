"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthService } from "../services/auth"
import { apiService } from "../services/api"

const Login = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const navigate = useNavigate()

  const handleConnectWallet = async () => {
    setLoading(true)
    setError("")

    try {
      // Connect to MetaMask
      const address = await AuthService.connectWallet()
      setWalletAddress(address)

      // Authenticate user
      const authData = await AuthService.authenticateUser(address)

      // Verify with backend
      const response = await apiService.verifyUser(authData.address, authData.message, authData.signature)

      // Store JWT token
      AuthService.setToken(response.token)

      // Redirect to dashboard
      navigate("/user")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DID KYC System</h1>
          <p className="text-gray-600">Connect your wallet to access the decentralized identity system</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">{error}</div>}

        {walletAddress && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
        )}

        <button
          onClick={handleConnectWallet}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Connecting...
            </>
          ) : (
            "Connect MetaMask Wallet"
          )}
        </button>

        <div className="mt-6 text-center text-sm text-gray-500">Make sure you have MetaMask installed and unlocked</div>
      </div>
    </div>
  )
}

export default Login
