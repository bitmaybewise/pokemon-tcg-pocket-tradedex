import { Card } from "@/types/card";
import styles from "./CompareCardGrid.module.css";
import Image from "next/image";

interface CompareCardGridProps {
  left: Record<string, Card[]>; // rarity -> cards
  right: Record<string, Card[]>; // rarity -> cards
  user1Name: string;
  user2Name: string;
}

export default function CompareCardGrid({
  left,
  right,
  user1Name,
  user2Name,
}: CompareCardGridProps) {
  // Get all rarities present in either side
  const allRarities = Array.from(
    new Set([...Object.keys(left), ...Object.keys(right)])
  ).sort();

  return (
    <div className={styles.compareGridWrapper}>
      <div className={styles.compareHeaderRow}>
        <div className={styles.compareColumnHeader}>{user1Name}</div>
        <div className={styles.compareColumnHeader}>{user2Name}</div>
      </div>
      {allRarities.map((rarity) => (
        <div key={rarity} className={styles.rarityRow}>
          <div className={styles.rarityLabel}>{rarity}</div>
          <div className={styles.compareColumn}>
            <div className={styles.cardGrid}>
              {(left[rarity] || []).map((card) => (
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
                </div>
              ))}
            </div>
          </div>
          <div className={styles.divider} />
          <div className={styles.compareColumn}>
            <div className={styles.cardGrid}>
              {(right[rarity] || []).map((card) => (
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
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
