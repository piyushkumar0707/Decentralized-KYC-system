"use client"

import { useState, useEffect } from "react"
import { apiService } from "../services/api"
import DIDManager from "../components/DIDManager.jsx"
import PrivacyToggle from "../components/PrivacyToggle.jsx"

const UserDashboard = () => {
  const [userId, setUserId] = useState("")
  const [privacySettings, setPrivacySettings] = useState({
    name: false,
    dob: false,
    email: false,
    phone: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    // Get user ID from localStorage or context
    // For demo purposes, we'll use a default or prompt user
    const storedUserId = localStorage.getItem("currentUserId") || "user123"
    setUserId(storedUserId)

    // Load privacy settings
    loadPrivacySettings(storedUserId)
  }, [])

  const loadPrivacySettings = async (uid) => {
    try {
      const response = await apiService.getUserDID(uid)
      if (response.privacySettings) {
        setPrivacySettings(response.privacySettings)
      }
    } catch (err) {
      console.log("Could not load privacy settings:", err.message)
    }
  }

  const handlePrivacyToggle = async (attribute, isPublic) => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const newSettings = {
        ...privacySettings,
        [attribute]: isPublic,
      }

      await apiService.updatePrivacy(userId, newSettings)
      setPrivacySettings(newSettings)
      setSuccess(`Privacy setting for ${attribute} updated successfully`)
    } catch (err) {
      setError("Failed to update privacy settings: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUserIdChange = (e) => {
    const newUserId = e.target.value
    setUserId(newUserId)
    localStorage.setItem("currentUserId", newUserId)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Dashboard</h1>
        <p className="text-gray-600">Manage your decentralized identity and privacy settings</p>
      </div>

      {/* Alerts */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">{error}</div>}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">{success}</div>
      )}

      {/* User ID Input */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">User Identification</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={userId}
            onChange={handleUserIdChange}
            placeholder="Enter your User ID"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* DID Information */}
      {userId && <DIDManager userId={userId} />}

      {/* Privacy Settings */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Privacy Settings</h2>
          <p className="text-gray-600 text-sm">
            Control which verifiable credentials are public or private. Private credentials are encrypted and only
            shared with your explicit consent.
          </p>
        </div>

        <div className="space-y-4">
          {Object.entries(privacySettings).map(([attribute, isPublic]) => (
            <PrivacyToggle
              key={attribute}
              attribute={attribute}
              isPublic={isPublic}
              onToggle={handlePrivacyToggle}
              disabled={loading}
            />
          ))}
        </div>

        {loading && (
          <div className="mt-4 text-center">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Updating privacy settings...</span>
          </div>
        )}
      </div>

      {/* Privacy Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">About Privacy Settings</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Public credentials can be verified by anyone with your DID</li>
                <li>Private credentials require your explicit consent to share</li>
                <li>All credentials are cryptographically signed and tamper-proof</li>
                <li>You can change these settings at any time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
