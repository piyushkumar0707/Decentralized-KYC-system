"use client"

import { useState, useEffect } from "react"
import { apiService } from "../services/api.js"

const DIDManager = ({ userId }) => {
  const [didData, setDidData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchDIDData = async () => {
    try {
      setLoading(true)
      const response = await apiService.getUserDID(userId)
      setDidData(response)
    } catch (err) {
      setError("Failed to fetch DID data: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchDIDData()
    }
  }, [userId])


  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  if (!didData || !didData.did) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No DID Registered</h3>
          <p className="text-gray-500">Contact an issuer to register your decentralized identity.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">DID Information</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Decentralized Identifier (DID)</label>
          <div className="bg-gray-50 p-3 rounded-md">
            <code className="text-sm text-gray-800 break-all">{didData.did}</code>
          </div>
        </div>

        {didData.cidHash && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DID Document CID</label>
            <div className="bg-gray-50 p-3 rounded-md">
              <code className="text-sm text-gray-800 break-all">{didData.cidHash}</code>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blockchain Status</label>
          <div className="flex items-center">
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                didData.blockchainStatus === "confirmed"
                  ? "bg-green-100 text-green-800"
                  : didData.blockchainStatus === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {didData.blockchainStatus || "unknown"}
            </span>
          </div>
        </div>

        {didData.transactionHash && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Hash</label>
            <div className="bg-gray-50 p-3 rounded-md">
              <code className="text-sm text-gray-800 break-all">{didData.transactionHash}</code>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DIDManager
