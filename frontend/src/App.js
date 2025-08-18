// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import UserDashBoard from "./pages/UserDashBoard";
import IssuerDashBoard from "./pages/IssuerDashBoard";

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">User</Link> | <Link to="/issuer">Issuer</Link>
      </nav>
      <Routes>
        <Route path="/" element={<UserDashBoard />} />
        <Route path="/issuer" element={<IssuerDashBoard />} />
      </Routes>
    </Router>
  );
}

export default App;
