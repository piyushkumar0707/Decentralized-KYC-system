// src/component/kycAdminView.jsx
import React, { useEffect, useState } from "react";
import { approveKYC } from "../Services/api";

export default function KycAdminView() {
  const [requests, setRequests] = useState([
    { id: 1, name: "Alice", status: "Pending" },
    { id: 2, name: "Bob", status: "Pending" },
  ]);

  const handleApprove = async (id) => {
    try {
      await approveKYC(id);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r))
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>KYC Admin Panel</h2>
      <ul>
        {requests.map((req) => (
          <li key={req.id}>
            {req.name} - {req.status}{" "}
            {req.status === "Pending" && (
              <button onClick={() => handleApprove(req.id)}>Approve</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
