import ColorCircle from '@/components/ColorCircle/ColorCircle';
import ColorData from '@/components/ColorData/ColorData';
import ColorHistory from '@/components/ColorHistory/ColorHistory';
import ImagePicker from '@/components/ImagePicker/ImagePicker';
import { useColorHistory } from '@/hooks/useColorHistory';
import { useColorPicker } from '@/hooks/useColorPicker';
import { colorFromHsv } from '@/utils/color';
import logo from '@/assets/ColorPicker.png';
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
    <div className={styles.page}>
      <div className={styles.header}>
        <img className={styles.logo} src={logo} alt="ColorPicker" width={370} height={92} draggable={false} />
      </div>
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
      <a
        className={styles.authorLink}
        href="https://x.com/Mars_Neobase"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="作者のXアカウント（新しいタブで開く）"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 16 16">
          <path d="M0 0h16v16H0z" fill="none" />
          <path fill="currentColor" d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07l-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
        </svg>
      </a>
    </div>
  );
}
