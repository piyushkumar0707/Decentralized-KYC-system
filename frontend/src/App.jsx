
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthService } from "./services/auth.js"
import Navbar from "./components/Navbar.jsx"
import Login from "./pages/Login.jsx"
import IssuerDashboard from "/pages/IssuerDashboard.jsx"
import UserDashboard from "/pages/UserDashboard.jsx"
import Profile from "./pages/Profile.jsx"

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  return AuthService.isAuthenticated() ? children : <Navigate to="/login" />
}

function App() {
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
          <Route path="/" element={<Navigate to="/user" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
