"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/contexts/ProfileContext";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import Link from "next/link";

interface FriendComparison {
  id: string;
  friendId1: string;
  friendId2: string;
  timestamp?: { seconds: number; nanoseconds: number };
}

export default function CompareStartPage() {
  const { profile } = useProfile();
  const [friendId, setFriendId] = useState("");
  const [error, setError] = useState("");
  const [recentComparisons, setRecentComparisons] = useState<
    FriendComparison[]
  >([]);
  const [loadingComparisons, setLoadingComparisons] = useState(false);
  const router = useRouter();

  // Fetch all comparisons for this user
  useEffect(() => {
    const fetchComparisons = async () => {
      if (!profile?.friendId) return;
      setLoadingComparisons(true);
      try {
        const comparisonsRef = collection(db, "friend_comparisons");
        const q = query(
          comparisonsRef,
          where("participants", "array-contains", profile.friendId),
          orderBy("timestamp", "desc")
        );
        const snap = await getDocs(q);
        const items: FriendComparison[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<FriendComparison, "id">),
        }));
        setRecentComparisons(items);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingComparisons(false);
      }
    };
    fetchComparisons();
  }, [profile?.friendId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
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
    // Store or update comparison in Firestore
    try {
      const comparisonsRef = collection(db, "friend_comparisons");
      // Always use sorted participants for uniqueness
      const participants = [profile.friendId, friendId].sort();
      // Query for existing comparison
      const q = query(
        comparisonsRef,
        where("participants", "==", participants)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        // Update timestamp of the first found document
        const docRef = snap.docs[0].ref;
        await updateDoc(docRef, { timestamp: Timestamp.now() });
      } else {
        // Create new document
        await addDoc(comparisonsRef, {
          friendId1: profile.friendId,
          friendId2: friendId,
          participants,
          timestamp: Timestamp.now(),
        });
      }
    } catch (e) {
      console.error(e);
    }
    router.push(`/compare/${profile.friendId}/${friendId}`);
  };

  return (
    <main>
      <div
        className="nes-container with-title is-centered"
        style={{ maxWidth: 480, margin: "40px auto" }}
      >
        <p className="title">Compare With a Friend</p>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
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
        {/* Recent comparisons */}
        {profile && (
          <>
            <div style={{ marginTop: 32, marginBottom: 8 }}>
              <h3
                style={{
                  margin: 0,
                  fontWeight: 700,
                  fontSize: "1.1em",
                  textAlign: "center",
                }}
              >
                Recent comparisons
              </h3>
            </div>
            <div>
              {loadingComparisons ? (
                <p>Loading…</p>
              ) : recentComparisons.length === 0 ? (
                <p>No recent comparisons.</p>
              ) : (
                <ul style={{ paddingLeft: 0, listStyle: "none" }}>
                  {recentComparisons.map((cmp) => (
                    <ComparisonListItem
                      key={cmp.id}
                      cmp={cmp}
                      selfId={profile.friendId}
                    />
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function ComparisonListItem({
  cmp,
  selfId,
}: {
  cmp: FriendComparison;
  selfId: string;
}) {
  const [user1, setUser1] = useState<string>(cmp.friendId1);
  const [user2, setUser2] = useState<string>(cmp.friendId2);
  const { getProfileByFriendId } = useProfile();

  useEffect(() => {
    let mounted = true;
    const fetchNames = async () => {
      const [p1, p2] = await Promise.all([
        getProfileByFriendId(cmp.friendId1),
        getProfileByFriendId(cmp.friendId2),
      ]);
      if (mounted) {
        setUser1(p1?.nickname || cmp.friendId1);
        setUser2(p2?.nickname || cmp.friendId2);
      }
    };
    fetchNames();
    return () => {
      mounted = false;
    };
  }, [cmp.friendId1, cmp.friendId2, getProfileByFriendId]);

  return (
    <li style={{ marginBottom: 8 }}>
      <Link href={`/compare/${cmp.friendId1}/${cmp.friendId2}`}>{user2}</Link>
    </li>
  );
}
