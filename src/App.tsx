import ColorCircle from '@/components/ColorCircle/ColorCircle';
import ColorData from '@/components/ColorData/ColorData';
import ColorHistory from '@/components/ColorHistory/ColorHistory';
import ImagePicker from '@/components/ImagePicker/ImagePicker';
import { useColorHistory } from '@/hooks/useColorHistory';
import { useColorPicker } from '@/hooks/useColorPicker';
import { colorFromHsv } from '@/utils/color';
import styles from './App.module.css';

export default function App() {
  const picker = useColorPicker();
  const colorHistory = useColorHistory();
  const commitColor = (color: typeof picker.color) => {
    picker.selectColor(color);
    colorHistory.add(color);
  };

  return (
    <main className={styles.app}>
      <aside className={styles.sidebar}>
        <ColorCircle hsv={picker.color.hsv} onChange={(hsv) => commitColor(colorFromHsv(hsv))} />
        <ColorData color={picker.color} />
        <ColorHistory history={colorHistory.history} onSelect={commitColor} />
      </aside>
      <section className={styles.imageArea}>
        <ImagePicker onColorPick={commitColor} />
      </section>
    </main>
  );
}
