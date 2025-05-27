"use client";

import { Card } from "@/types/card";
import cards from "@/../v4.json";
import { useProfile } from "@/contexts/ProfileContext";
import { getCollectionByFriendId } from "@/contexts/CollectionContext";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import CardGrid from "@/components/CardGrid";
import FilterBar from "@/components/FilterBar";
import { useAuth } from "@/contexts/AuthContext";

export default function PublicProfilePage() {
  const { friendId } = useParams();
  const { getProfileByFriendId } = useProfile();
  const [cardQuantities, setCardQuantities] = useState<Record<string, number>>(
    {}
  );
  const [collectionLoading, setCollectionLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [filterName, setFilterName] = useState("");
  const [filterRarity, setFilterRarity] = useState("");
  const [filterPack, setFilterPack] = useState("");

  // Get unique rarities and packs for dropdowns
  const rarities = useMemo(
    () => Array.from(new Set((cards as Card[]).map((card) => card.rarity))),
    []
  );
  const packs = useMemo(
    () => Array.from(new Set((cards as Card[]).map((card) => card.pack))),
    []
  );

  // Filtered cards - only show cards that the user owns
  const filteredCards = useMemo(() => {
    return (cards as Card[]).filter((card) => {
      const hasCard = cardQuantities[card.id] > 0;
      // Get the last three digits of the card ID for searching
      const cardIdDigits = card.id.slice(-3);
      
      // Match if the name contains the search term OR if the last three digits match the search term
      const matchesName = card.name
        .toLowerCase()
        .includes(filterName.toLowerCase());
      const matchesIdDigits = filterName.trim() !== "" && cardIdDigits.includes(filterName.trim());
      const matchesRarity = filterRarity ? card.rarity === filterRarity : true;
      const matchesPack = filterPack ? card.pack === filterPack : true;
      
      return hasCard && (matchesName || matchesIdDigits) && matchesRarity && matchesPack;
    });
  }, [filterName, filterRarity, filterPack, cardQuantities]);

  const { user } = useAuth();

  useEffect(() => {
    const fetchProfileAndCollection = async () => {
      try {
        const profileData = await getProfileByFriendId(friendId as string);
        if (profileData) {
          setProfile(profileData);
          // Fetch collection for this user
          const quantities = await getCollectionByFriendId(friendId as string);
          setCardQuantities(quantities);
        } else {
          setError("Profile not found");
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
        setCollectionLoading(false);
      }
    };
    fetchProfileAndCollection();
  }, [friendId, getProfileByFriendId]);

  // Compare With handler
  const handleCompare = () => {
    const otherFriendId = window.prompt("Enter the Friend ID to compare with:");
    if (!otherFriendId) return;
    if (!profile?.friendId) {
      alert("You must have a profile with a Friend ID to use compare.");
      return;
    }
    window.location.href = `/compare/${profile.friendId}/${otherFriendId}`;
  };

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
        <p className="title">
          {profile?.nickname || "Who's That Pokémon Trainer?"}
        </p>
        <div
          style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}
        >
          <i className="nes-ash"></i>
        </div>
        <div className={styles.stats}>
          <p>Friend ID: {profile?.friendId}</p>
          {user && (
            <Link href="/profile" className={`nes-btn ${styles.smallButton}`}>
              Edit Profile
            </Link>
          )}
          {user && profile?.friendId && (
            <Link
              href="/compare/start"
              className={`nes-btn ${styles.smallButton}`}
              style={{ marginTop: 8 }}
            >
              Compare With a Friend
            </Link>
          )}
        </div>
      </div>

      <div className="nes-container">
        <div className={styles.stats}>
          <p>
            Total Cards:{" "}
            {
              Object.keys(cardQuantities).filter((id) => cardQuantities[id] > 0)
                .length
            }
          </p>
          <p>
            Total Quantity:{" "}
            {Object.values(cardQuantities).reduce((a, b) => a + b, 0)}
          </p>
        </div>
      </div>

      <FilterBar
        filterName={filterName}
        setFilterName={setFilterName}
        filterRarity={filterRarity}
        setFilterRarity={setFilterRarity}
        filterPack={filterPack}
        setFilterPack={setFilterPack}
        rarities={rarities}
        packs={packs}
      />

      <CardGrid cards={filteredCards} />
    </main>
  );
}
