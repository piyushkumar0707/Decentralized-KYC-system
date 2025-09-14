import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthService } from "./services/auth.js"
import Navbar from "./components/Navbar"
import Login from "./pages/Login"
import IssuerDashboard from "./pages/IssuerDashboard"
import UserDashboard from "./pages/UserDashboard"
import Profile from "./pages/Profile"

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  console.log("[v0] Checking authentication:", AuthService.isAuthenticated())
  return AuthService.isAuthenticated() ? children : <Navigate to="/login" />
}

function App() {
  console.log("[v0] App component rendering")

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/issuer"
            element={
              <ProtectedRoute>
                <IssuerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

