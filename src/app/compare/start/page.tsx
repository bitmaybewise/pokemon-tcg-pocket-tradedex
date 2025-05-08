"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/contexts/ProfileContext";

export default function CompareStartPage() {
  const { profile } = useProfile();
  const [friendId, setFriendId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleFriendIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and dashes, and auto-insert dashes
    const value = e.target.value.replace(/\D/g, "");
    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1-");
    setFriendId(formatted.slice(0, 19));
  };

  const validateFriendId = (id: string) => {
    const pattern = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
    return pattern.test(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!profile?.friendId) {
      setError("You must have a profile with a Friend ID to use compare.");
      return;
    }
    if (!validateFriendId(friendId)) {
      setError("Friend ID must be in the format 9999-9999-9999-9999");
      return;
    }
    router.push(`/compare/${profile.friendId}/${friendId}`);
  };

  return (
    <main>
      <div className="nes-container with-title is-centered" style={{ maxWidth: 480, margin: "40px auto" }}>
        <p className="title">Compare With a Friend</p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <label htmlFor="friend-id">Friend ID:</label>
          <input
            id="friend-id"
            className="nes-input"
            type="text"
            value={friendId}
            onChange={handleFriendIdChange}
            placeholder="9999-9999-9999-9999"
            maxLength={19}
            required
            autoFocus
          />
          <button type="submit" className="nes-btn is-primary">
            Compare
          </button>
          {error && <p className="nes-text is-error">{error}</p>}
        </form>
      </div>
    </main>
  );
} 