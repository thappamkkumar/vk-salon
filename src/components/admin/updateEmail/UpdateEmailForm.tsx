"use client";

import { useState, useEffect } from "react";

export default function UpdateEmailForm() {
  const [email, setEmail] = useState("");
  const [initialEmail, setInitialEmail] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchEmail = async () => {
      const res = await fetch("/api/admin/profile?id=1");
      const data = await res.json();
      setEmail(data.rows[0]?.email || "");
      setInitialEmail(data.rows[0]?.email || "");
    };
    fetchEmail();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");

    if (!email.includes("@")) {
      setStatus("Invalid email address.");
      return;
    }

    const res = await fetch("/api/admin/update-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: 1, email }),
    });

    const data = await res.json();

    if (data.status) {
      setStatus("Email updated successfully.");
      setInitialEmail(email);
    } else {
      setStatus(data.message || "Something went wrong.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status && <p className="text-sm text-gray-700">{status}</p>}

      <div>
        <label className="block font-medium">New Email</label>
        <input
          type="email"
          className="w-full border rounded p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="bg-black cursor-pointer hover:bg-gray-900 text-white px-4 py-2 rounded"
        disabled={email === initialEmail}
      >
        Update Email
      </button>
    </form>
  );
}
