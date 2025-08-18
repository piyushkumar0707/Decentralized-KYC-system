// src/pages/UserDashBoard.jsx
import React from "react";
import WalletView from "../component/WalletView";
import CredentialsView from "../component/CredentialsView";

export default function UserDashBoard() {
  return (
    <div>
      <h1>User Dashboard</h1>
      <WalletView />
      <CredentialsView />
    </div>
  );
}