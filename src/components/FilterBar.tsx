import { Card } from "@/types/card";
import styles from "./FilterBar.module.css";

interface FilterBarProps {
  filterName: string;
  setFilterName: (value: string) => void;
  filterRarity: string;
  setFilterRarity: (value: string) => void;
  filterPack: string;
  setFilterPack: (value: string) => void;
  rarities: string[];
  packs: string[];
}

export default function FilterBar({
  filterName,
  setFilterName,
  filterRarity,
  setFilterRarity,
  filterPack,
  setFilterPack,
  rarities,
  packs,
}: FilterBarProps) {
  return (
    <div className={styles.filters}>
      <div className={`nes-field ${styles.filterField}`}>
        <label htmlFor="filter-name">Filter</label>
        <input
          id="filter-name"
          className="nes-input"
          type="text"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          placeholder="Search by name or #"
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
  );
} 