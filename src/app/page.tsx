"use client";

import { Card } from "@/types/card";
import cards from "@/../v4.json";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useMemo } from "react";

export default function Home() {
  const { user, loading, signIn, signUp, logout } = useAuth();
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

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <div className="nes-container with-title is-centered">
          <p className="title">Loading</p>
          <p>Please wait...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="nes-container with-title is-centered mb-8">
        {user ? (
          <>
            <h1 className="text-2xl">Welcome back, {user.email}!</h1>
            <div className="mt-8">
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
            <form onSubmit={handleSubmit} className="grid grid-cols-5 mt-8">
              <div className="nes-field mb-4">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  className="nes-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="nes-field mb-4">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  className="nes-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <div className="flex gap-4">
                <label htmlFor="submit"></label>
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
            </form>
          </>
        )}
      </div>

      <h2 className="grid grid-cols-5 gap-4 nes-container text-3xl font-bold text-center mb-8">
        Pokémon TCG Pocket Cards
      </h2>
      <div className="grid grid-cols-5 gap-4 nes-container is-centered">
        <div className="nes-field">
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
        <div className="nes-select">
          <label htmlFor="filter-rarity">Rarity</label>
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
        <div className="nes-select">
          <label htmlFor="filter-pack">Pack</label>
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
      <div className="grid grid-cols-5 gap-4 nes-container is-centered with-title">
        {filteredCards.map((card) => (
          <div key={card.id}>
            <p className="title">{card.name}</p>
            <img
              src={card.image}
              alt={card.name}
              className="w-full h-auto mb-2"
            />
            <div className="text-sm">
              <p>Health: {card.health}</p>
              <p>Rarity: {card.rarity}</p>
              <p>Pack: {card.pack}</p>
              {card.ex === "Yes" && <p className="text-red-500">EX Card</p>}
              <p className="text-xs mt-2">Artist: {card.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
