import type { ColorHistoryItem } from '@/types/color';

type ColorHistoryProps = {
  history: ColorHistoryItem[];
  onSelect: (item: ColorHistoryItem) => void;
};

export default function ColorHistory({ history, onSelect }: ColorHistoryProps) {
  return (
    <section aria-label="色の履歴">
      <h2>履歴</h2>
      <div role="list" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {history.map((item) => (
          <button
            key={item.id}
            type="button"
            role="listitem"
            aria-label={`${item.hex}を選択`}
            title={item.hex}
            onClick={() => onSelect(item)}
            style={{ backgroundColor: item.hex, width: 48, height: 48 }}
          />
        ))}
      </div>
    </section>
  );
}
