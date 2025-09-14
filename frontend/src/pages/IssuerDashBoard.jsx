"use client"

import { useState, useEffect } from "react"
import { apiService } from "../services/api.js"

const IssuerDashboard = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [newUserId, setNewUserId] = useState("")
  const [registering, setRegistering] = useState(false)
  const [revokeData, setRevokeData] = useState({ userId: "", reason: "" })
  const [revoking, setRevoking] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAllUsers()
      setUsers(response.users || [])
    } catch (err) {
      setError("Failed to fetch users: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterDID = async (e) => {
    e.preventDefault()
    if (!newUserId.trim()) return

    setRegistering(true)
    setError("")
    setSuccess("")

    try {
      await apiService.registerDID(newUserId.trim())
      setSuccess(`DID registered successfully for user: ${newUserId}`)
      setNewUserId("")
      fetchUsers() // Refresh the list
    } catch (err) {
      setError("Failed to register DID: " + err.message)
    } finally {
      setRegistering(false)
    }
  }

  const handleRevokeDID = async (userId, reason) => {
    if (!reason.trim()) {
      setError("Please provide a reason for revocation")
      return
    }

    setRevoking(true)
    setError("")
    setSuccess("")

    try {
      await apiService.revokeDID(userId, reason)
      setSuccess(`DID revoked successfully for user: ${userId}`)
      setRevokeData({ userId: "", reason: "" })
      fetchUsers() // Refresh the list
    } catch (err) {
      setError("Failed to revoke DID: " + err.message)
    } finally {
      setRevoking(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Issuer Dashboard</h1>
        <p className="text-gray-600">Manage DIDs and user registrations</p>
      </div>

      {/* Alerts */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">{error}</div>}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">{success}</div>
      )}

      {/* Register New DID */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Register New DID</h2>
        <form onSubmit={handleRegisterDID} className="flex gap-4">
          <input
            type="text"
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            placeholder="Enter User ID"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <button
            type="submit"
            disabled={registering || !newUserId.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md transition-colors duration-200"
          >
            {registering ? "Registering..." : "Register DID"}
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Registered Users</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No users registered yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.did ? (
                        <span className="font-mono text-xs">{user.did.slice(0, 20)}...</span>
                      ) : (
                        "Not registered"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : user.status === "revoked"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.status || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.did && user.status !== "revoked" && (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Revocation reason"
                            value={revokeData.userId === user.id ? revokeData.reason : ""}
                            onChange={(e) => setRevokeData({ userId: user.id, reason: e.target.value })}
                            className="px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                          <button
                            onClick={() => handleRevokeDID(user.id, revokeData.reason)}
                            disabled={revoking || !revokeData.reason.trim() || revokeData.userId !== user.id}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-1 text-xs rounded transition-colors duration-200"
                          >
                            {revoking && revokeData.userId === user.id ? "Revoking..." : "Revoke"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default IssuerDashboard


