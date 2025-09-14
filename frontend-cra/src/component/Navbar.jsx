"use client"
import { Link, useNavigate } from "react-router-dom"
import { AuthService } from "../services/auth.js"

const Navbar = () => {
  const navigate = useNavigate()
  const isAuthenticated = AuthService.isAuthenticated()

  const handleLogout = () => {
    AuthService.removeToken()
    navigate("/login")
  }

  return (
    <nav className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-400">
              DID KYC System
            </Link>
          </div>

          {isAuthenticated && (
            <div className="flex items-center space-x-6">
              <Link to="/issuer" className="hover:text-blue-400 transition-colors duration-200">
                Issuer Dashboard
              </Link>
              <Link to="/user" className="hover:text-blue-400 transition-colors duration-200">
                User Dashboard
              </Link>
              <Link to="/profile" className="hover:text-blue-400 transition-colors duration-200">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
