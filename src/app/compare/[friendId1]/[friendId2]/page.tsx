"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import cards from "@/../v4.json";
import { Card } from "@/types/card";
import { getCollectionByFriendId } from "@/contexts/CollectionContext";
import FilterBar from "@/components/FilterBar";
import CompareCardGrid from "@/components/CompareCardGrid";
import { useProfile } from "@/contexts/ProfileContext";
import Link from "next/link";

export default function ComparePage() {
  const { friendId1, friendId2 } = useParams();
  const [collection1, setCollection1] = useState<Record<string, number>>({});
  const [collection2, setCollection2] = useState<Record<string, number>>({});
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

  const [user1Name, setUser1Name] = useState("User 1 Only");
  const [user2Name, setUser2Name] = useState("User 2 Only");
  const { getProfileByFriendId } = useProfile();

  // Fetch both collections
  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      try {
        const [col1, col2] = await Promise.all([
          getCollectionByFriendId(friendId1 as string),
          getCollectionByFriendId(friendId2 as string),
        ]);
        setCollection1(col1);
        setCollection2(col2);
        // Fetch nicknames
        const [profile1, profile2] = await Promise.all([
          getProfileByFriendId(friendId1 as string),
          getProfileByFriendId(friendId2 as string),
        ]);
        setUser1Name(profile1?.nickname || friendId1 as string || "User 1 Only");
        setUser2Name(profile2?.nickname || friendId2 as string || "User 2 Only");
      } catch (err: any) {
        setError("Error fetching collections");
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, [friendId1, friendId2, getProfileByFriendId]);

  // Unique cards for each user
  const user1Only = useMemo(() => {
    return (cards as Card[]).filter(
      (card) => (collection1[card.id] > 0) && (!collection2[card.id] || collection2[card.id] === 0)
    );
  }, [collection1, collection2]);

  const user2Only = useMemo(() => {
    return (cards as Card[]).filter(
      (card) => (collection2[card.id] > 0) && (!collection1[card.id] || collection1[card.id] === 0)
    );
  }, [collection1, collection2]);

  // Apply filters
  const filteredUser1Only = useMemo(() => {
    return user1Only.filter((card) => {
      const matchesName = card.name.toLowerCase().includes(filterName.toLowerCase());
      const matchesRarity = filterRarity ? card.rarity === filterRarity : true;
      const matchesPack = filterPack ? card.pack === filterPack : true;
      return matchesName && matchesRarity && matchesPack;
    });
  }, [user1Only, filterName, filterRarity, filterPack]);

  const filteredUser2Only = useMemo(() => {
    return user2Only.filter((card) => {
      const matchesName = card.name.toLowerCase().includes(filterName.toLowerCase());
      const matchesRarity = filterRarity ? card.rarity === filterRarity : true;
      const matchesPack = filterPack ? card.pack === filterPack : true;
      return matchesName && matchesRarity && matchesPack;
    });
  }, [user2Only, filterName, filterRarity, filterPack]);

  // Group by rarity
  function groupByRarity(cards: Card[]): Record<string, Card[]> {
    return cards.reduce((acc, card) => {
      if (!acc[card.rarity]) acc[card.rarity] = [];
      acc[card.rarity].push(card);
      return acc;
    }, {} as Record<string, Card[]>);
  }

  const left = groupByRarity(filteredUser1Only);
  const right = groupByRarity(filteredUser2Only);

  if (loading) {
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
      <div style={{ marginBottom: 24 }}>
        <Link href="/" className="nes-btn">
          ← Back to Home
        </Link>
      </div>
      <div className="nes-container with-title is-centered">
        <p className="title">Compare Collections</p>
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
      <CompareCardGrid left={left} right={right} user1Name={user1Name} user2Name={user2Name} />
    </main>
  );
} 