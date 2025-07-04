"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useCollection } from "@/contexts/CollectionContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

export default function ProfilePage() {
  const { user, loading: authLoading, logout, deleteUserAccount } = useAuth();
  const {
    profile,
    loading: profileLoading,
    updateProfile,
    getProfileByFriendId,
    deleteProfile,
  } = useProfile();
  const { cardQuantities, loading: collectionLoading } = useCollection();
  const [friendId, setFriendId] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (profile) {
      setFriendId(profile.friendId);
      setNickname(profile.nickname);
    }
  }, [profile]);

  if (authLoading || profileLoading || collectionLoading) {
    return (
      <main>
        <div className="nes-container with-title is-centered">
          <p className="title">Loading</p>
          <p>Please wait...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    router.push("/");
    return null;
  }

  const handleFriendIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1-");
    setFriendId(formatted);
  };

  const validateFriendId = (id: string) => {
    const pattern = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
    return pattern.test(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateFriendId(friendId)) {
      setError("Friend ID must be in the format 9999-9999-9999-9999");
      return;
    }

    // Check uniqueness
    const existingProfile = await getProfileByFriendId(friendId);
    if (existingProfile && existingProfile.userId !== profile?.userId) {
      setError("This Friend ID is already in use by another user.");
      return;
    }

    try {
      await updateProfile(friendId, nickname);
      setSuccess(true);
      setTimeout(() => {
        router.push(`/profile/${friendId}`);
      }, 1200);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDeleteProfile = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your profile? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await deleteProfile();
      await deleteUserAccount();
      await logout();
      router.push("/");
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <main>
      <div className={styles.header}>
        {profile?.friendId ? (
          <Link href={`/profile/${profile.friendId}`} className="nes-btn">
            ← Back to Profile
          </Link>
        ) : (
          <Link href="/" className="nes-btn">
            ← Back to Home
          </Link>
        )}
      </div>

      <div className="nes-container with-title is-centered">
        <p className="title">Edit Profile</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="nes-field">
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
            />
          </div>
          <div className="nes-field">
            <label htmlFor="nickname">Nickname:</label>
            <input
              id="nickname"
              className="nes-input"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Your nickname"
              required
            />
          </div>
          <div className={styles.buttonGroup}>
            <button type="submit" className="nes-btn is-primary">
              Save Profile
            </button>
            {profile && (
              <button
                type="button"
                className="nes-btn is-error"
                onClick={handleDeleteProfile}
              >
                Delete Profile
              </button>
            )}
          </div>
          {success && (
            <p className="nes-text is-success">Profile saved! Redirecting…</p>
          )}
          {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>
    </main>
  );
}
