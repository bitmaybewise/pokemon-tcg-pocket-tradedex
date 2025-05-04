import { Card } from '@/types/card';
import cards from '@/../v4.json';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="nes-container with-title is-centered mb-8">
        <p className="title">Welcome</p>
        <h1 className="text-2xl">Hello, Pokémon trainer!</h1>
        <div className="mt-8">
          <button type="button" className="nes-btn is-primary">Start Journey</button>
        </div>
      </div>
      
      <h2 className="text-3xl font-bold text-center mb-8">Pokémon TCG Pocket Cards</h2>
      <div className="grid grid-cols-5 gap-4 nes-container is-centered with-title">
        {(cards as Card[]).map((card) => (
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