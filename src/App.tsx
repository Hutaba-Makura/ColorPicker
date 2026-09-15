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

  const previewHsv = (hsv: Parameters<typeof colorFromHsv>[0]) => picker.selectColor(colorFromHsv(hsv));
  return (
    <main className={styles.app}>
      <section className={styles.imageArea}>
        <ImagePicker onColorPreview={picker.selectColor} onColorPick={commitColor} />
      </section>
      <div className={styles.sidebar}>
        <div className={styles.colorCircleContainer}>
          <ColorCircle hsv={picker.color.hsv} onPreview={previewHsv} onChange={(hsv) => commitColor(colorFromHsv(hsv))} />
        </div>
        <ColorData color={picker.color} onChange={commitColor} />
        <ColorHistory history={colorHistory.history} onSelect={commitColor} />
      </div>
    </main>
  );
}
