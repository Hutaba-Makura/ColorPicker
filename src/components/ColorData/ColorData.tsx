import type { Color } from '@/types/color';
import styles from './ColorData.module.css';

type ColorDataProps = {
  color: Color;
};

export default function ColorData({ color }: ColorDataProps) {
  const { rgb, hsv, hex } = color;

  return (
    <section className={styles.data} aria-label="選択中の色">
      <div
        aria-label={`選択色 ${hex}`}
        className={styles.swatch}
        style={{ backgroundColor: hex }}
      />
      <dl className={styles.values}>
        <dt>HEX</dt>
        <dd>{hex}</dd>
        <dt>RGB</dt>
        <dd>({rgb.r}, {rgb.g}, {rgb.b})</dd>
        <dt>HSV</dt>
        <dd>({Math.round(hsv.h)}°, {Math.round(hsv.s * 100)}%, {Math.round(hsv.v * 100)}%)</dd>
      </dl>
    </section>
  );
}
