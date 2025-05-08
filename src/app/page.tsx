"use client";

import { Card } from "@/types/card";
import cards from "@/../v4.json";
import { useAuth } from "@/contexts/AuthContext";
import { useCollection } from "@/contexts/CollectionContext";
import { useState, useMemo } from "react";
import styles from "./page.module.css";

export default function Home() {
  const { user, loading: authLoading, signIn, signUp, logout } = useAuth();
  const { cardQuantities, incrementCardQuantity, decrementCardQuantity, loading: collectionLoading } = useCollection();
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

  if (authLoading || collectionLoading) {
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
            <h1 className="text-2xl">Welcome back, {user.email}!</h1>
            <div>
              <button
                type="button"
                className="nes-btn is-error"
                onClick={logout}
              >
                Sign Out
              </button>
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

      <h2 className="nes-container with-title">
        Pokémon TCG Pocket Cards
      </h2>
      <div className={styles.filters}>
        <div className={`nes-field ${styles.filterField}`}>
          <label htmlFor="filter-name">Name</label>
          <input
            id="filter-name"
            className="nes-input"
            type="text"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="Search by name"
          />
        </div>
        
        <div className={`nes-field ${styles.filterField}`}>
          <label htmlFor="filter-rarity">Rarity</label>
          <div className="nes-select">
            <select
              id="filter-rarity"
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
            >
              <option value="">All</option>
              {rarities.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className={`nes-field ${styles.filterField}`}>
          <label htmlFor="filter-pack">Pack</label>
          <div className="nes-select">
            <select
              id="filter-pack"
              value={filterPack}
              onChange={(e) => setFilterPack(e.target.value)}
            >
              <option value="">All</option>
              {packs.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className={styles.cardGrid}>
        {filteredCards.map((card) => (
          <div
            key={card.id}
            className={`nes-container with-title is-centered ${styles.card}`}
          >
            <p className="title">{card.name}</p>
            <img
              src={card.image}
              alt={card.name}
              className={styles.cardImage}
            />
            <div className={styles.cardInfo}>
              <p>Health: {card.health}</p>
              <p>Rarity: {card.rarity}</p>
              <p>Pack: {card.pack}</p>
              {card.ex === "Yes" && <p className={styles.exCard}>EX Card</p>}
              <p className={styles.artist}>Artist: {card.artist}</p>
              {user && (
                <div className={styles.quantityControls}>
                  <button
                    className="nes-btn is-error"
                    onClick={(e) => {
                      e.stopPropagation();
                      decrementCardQuantity(card.id);
                    }}
                    disabled={!cardQuantities[card.id]}
                  >
                    -
                  </button>
                  <span>Quantity: {cardQuantities[card.id] || 0}</span>
                  <button
                    className="nes-btn is-success"
                    onClick={(e) => {
                      e.stopPropagation();
                      incrementCardQuantity(card.id);
                    }}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
