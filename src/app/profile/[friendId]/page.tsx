'use client';

import { Card } from "@/types/card";
import cards from "@/../v4.json";
import { useProfile } from "@/contexts/ProfileContext";
import { useCollection } from "@/contexts/CollectionContext";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import CardGrid from "@/components/CardGrid";
import FilterBar from "@/components/FilterBar";

export default function PublicProfilePage() {
  const { friendId } = useParams();
  const { getProfileByFriendId } = useProfile();
  const { cardQuantities, loading: collectionLoading } = useCollection();
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
      const matchesName = card.name
        .toLowerCase()
        .includes(filterName.toLowerCase());
      const matchesRarity = filterRarity ? card.rarity === filterRarity : true;
      const matchesPack = filterPack ? card.pack === filterPack : true;
      return hasCard && matchesName && matchesRarity && matchesPack;
    });
  }, [filterName, filterRarity, filterPack, cardQuantities]);

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