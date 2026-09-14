import type { ColorHistoryItem } from '@/types/color';
import styles from './ColorHistory.module.css';

type ColorHistoryProps = {
  history: ColorHistoryItem[];
  onSelect: (item: ColorHistoryItem) => void;
};

export default function ColorHistory({ history, onSelect }: ColorHistoryProps) {
  return (
    <section className={styles.history} aria-label="色の履歴">
      <h2>履歴</h2>
      <div className={styles.grid} role="list">
        {history.map((item) => (
          <button
            key={item.id}
            type="button"
            role="listitem"
            aria-label={`${item.hex}を選択`}
            title={item.hex}
            onClick={() => onSelect(item)}
            className={styles.item}
            style={{ backgroundColor: item.hex }}
          />
        ))}
      </div>
    </section>
  );
}
