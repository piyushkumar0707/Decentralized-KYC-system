// src/component/CredentialsView.jsx
import React, { useEffect, useState } from "react";
import { getCredentials } from "../Services/api";

export default function CredentialsView() {
  const [credentials, setCredentials] = useState([]);

  useEffect(() => {
    getCredentials()
      .then((res) => setCredentials(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Your Credentials</h2>
      <ul>
        {credentials.map((cred) => (
          <li key={cred._id}>
            {cred.type} - {cred.status}
          </li>
        ))}
      </ul>
    </div>
  );
}