'use client';

import { useProfile } from "@/contexts/ProfileContext";
import { useCollection } from "@/contexts/CollectionContext";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

export default function PublicProfilePage() {
  const { friendId } = useParams();
  const { getProfileByFriendId } = useProfile();
  const { cardQuantities, loading: collectionLoading } = useCollection();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getProfileByFriendId(friendId as string);
        if (profileData) {
          setProfile(profileData);
        } else {
          setError("Profile not found");
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [friendId, getProfileByFriendId]);

  if (loading || collectionLoading) {
    return (
      <main>
        <div className="nes-container with-title is-centered">
          <p className="title">Loading</p>
          <p>Please wait...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <div className="nes-container with-title is-centered">
          <p className="title">Error</p>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className={styles.header}>
        <Link href="/" className="nes-btn">
          ← Back to Home
        </Link>
      </div>

      <div className="nes-container with-title is-centered">
        <p className="title">{profile?.nickname || 'Unknown Trainer'}'s Collection</p>
        <div className={styles.stats}>
          <p>Friend ID: {profile?.friendId}</p>
          <a href="/profile" className="nes-btn">
            Edit Profile
          </a>
          <p>Total Cards: {Object.keys(cardQuantities).length}</p>
          <p>Total Quantity: {Object.values(cardQuantities).reduce((a, b) => a + b, 0)}</p>
        </div>
      </div>
    </main>
  );
} 