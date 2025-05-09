"use client";

import { Card } from "@/types/card";
import cards from "@/../v4.json";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useCollection } from "@/contexts/CollectionContext";
import { useState, useMemo } from "react";
import styles from "./page.module.css";
import CardGrid from "@/components/CardGrid";
import FilterBar from "@/components/FilterBar";
import Link from "next/link";

export default function Home() {
  const { user, loading: authLoading, signIn, signUp, logout } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const {
    cardQuantities,
    incrementCardQuantity,
    decrementCardQuantity,
    loading: collectionLoading,
  } = useCollection();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
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

  // Filtered cards
  const filteredCards = useMemo(() => {
    return (cards as Card[]).filter((card) => {
      const matchesName = card.name
        .toLowerCase()
        .includes(filterName.toLowerCase());
      const matchesRarity = filterRarity ? card.rarity === filterRarity : true;
      const matchesPack = filterPack ? card.pack === filterPack : true;
      return matchesName && matchesRarity && matchesPack;
    });
  }, [filterName, filterRarity, filterPack]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

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

  return (
    <main>
      <div className="nes-container with-title is-centered">
        {user ? (
          <>
            <h1 className="text-2xl">
              Welcome back, {profile?.nickname || user.email}!
            </h1>
            <div className={styles.form}>
              <div className={styles.buttonGroup}>
                {profile ? (
                  <Link
                    href={`/profile/${profile.friendId}`}
                    className="nes-btn"
                  >
                    View Profile
                  </Link>
                ) : (
                  <Link href="/profile" className="nes-btn is-primary">
                    Edit Profile
                  </Link>
                )}
                <button
                  type="button"
                  className="nes-btn is-error"
                  onClick={logout}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl">Hello, Pokémon trainer!</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={`nes-field ${styles.formField}`}>
                <label htmlFor="email">Email:</label>
                <input
                  id="email"
                  className="nes-input"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className={`nes-field ${styles.formField}`}>
                <label htmlFor="password">Password:</label>
                <input
                  id="password"
                  className="nes-input"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className={styles.formButtons}>
                <button type="submit" className="nes-btn is-primary">
                  {isSignUp ? "Sign Up" : "Sign In"}
                </button>
                <button
                  type="button"
                  className="nes-btn"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? "Already have an account?" : "Need an account?"}
                </button>
              </div>
              {error && <p className={styles.error}>{error}</p>}
            </form>
          </>
        )}
      </div>

      <h2 className="nes-container with-title">Pokémon TCG Pocket Cards</h2>
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
      <CardGrid cards={filteredCards} filterPack={filterPack} />
    </main>
  );
}
