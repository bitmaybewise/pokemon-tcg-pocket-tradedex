import { Card } from "@/types/card";
import { useCollection } from "@/contexts/CollectionContext";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./CardGrid.module.css";
import Image from "next/image";

interface CardGridProps {
  cards: Card[];
  filterPack?: string;
}

export default function CardGrid({ cards, filterPack }: CardGridProps) {
  const { cardQuantities, incrementCardQuantity, decrementCardQuantity } =
    useCollection();
  const { user } = useAuth();

  // Add all filtered cards at once
  const handleAddAll = async () => {
    for (const card of cards) {
      await incrementCardQuantity(card.id);
    }
  };

  return (
    <div>
      {user && filterPack && (
        <button
          className="nes-btn is-success"
          style={{ marginBottom: 16 }}
          onClick={handleAddAll}
        >
          Add All to Collection
        </button>
      )}
      <div className={styles.cardGrid}>
        {cards.map((card) => (
          <div
            key={card.id}
            className={`nes-container with-title is-centered ${styles.card}`}
          >
            <p className="title">{card.name}</p>
            <div className={styles.imageWrapper}>
              <Image
                src={card.image}
                alt={card.name}
                className={styles.cardImage}
                width={200}
                height={280}
                unoptimized
              />
            </div>
            <div className={styles.cardInfo}>
              <p>Health: {card.health}</p>
              <p>Rarity: {card.rarity}</p>
              <p>Pack: {card.pack} <p># {card.id.slice(-3)}</p></p>
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
    </div>
  );
}
