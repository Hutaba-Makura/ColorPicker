import { useLayoutEffect, useRef, useState } from 'react';
import * as ColorWheel from 'react-hsv-ring';
import type { HSV } from '@/types/color';
import { colorFromHex } from '@/utils/color';
import styles from './ColorCircle.module.css';

type ColorCircleProps = { hsv: HSV; onPreview?: (hsv: HSV) => void; onChange: (hsv: HSV) => void };

const hsvToHex = (hsv: HSV) => {
  const h = hsv.h / 60;
  const i = Math.floor(h);
  const f = h - i;
  const p = hsv.v * (1 - hsv.s);
  const q = hsv.v * (1 - hsv.s * f);
  const t = hsv.v * (1 - hsv.s * (1 - f));
  const values = [[hsv.v, t, p], [q, hsv.v, p], [p, hsv.v, t], [p, q, hsv.v], [t, p, hsv.v], [hsv.v, p, q]][i % 6];
  return `#${values.map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('')}`;
};

const MIN_DESKTOP_WHEEL_SIZE = 180;

export default function ColorCircle({ hsv, onPreview, onChange }: ColorCircleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const slidersRef = useRef<HTMLDivElement>(null);
  const [wheelSize, setWheelSize] = useState(216);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const sliders = slidersRef.current;
    const wrapper = container?.parentElement;
    const sidebar = wrapper?.parentElement;
    if (!container || !sliders || !wrapper || !sidebar) return;
    const siblings = Array.from(sidebar.children).filter((child) => child !== wrapper);
    const mobileLayout = window.matchMedia('(max-width: 1023px)');
    const fitWheel = () => {
      if (mobileLayout.matches) {
        setWheelSize(Math.max(112, Math.floor(Math.min(216, container.clientWidth))));
        return;
      }
      const margin = Number.parseFloat(getComputedStyle(sliders).marginTop) || 0;
      const sidebarStyle = getComputedStyle(sidebar);
      const padding = (Number.parseFloat(sidebarStyle.paddingTop) || 0)
        + (Number.parseFloat(sidebarStyle.paddingBottom) || 0);
      const gaps = (Number.parseFloat(sidebarStyle.rowGap) || 0) * siblings.length;
      const otherHeight = siblings.reduce((sum, child) => sum + child.getBoundingClientRect().height, 0);
      // 内容自身の高さを参照すると、縮小→再計測の繰り返しになるため、親の利用可能な高さから計算する。
      const available = sidebar.clientHeight - padding - gaps - otherHeight
        - sliders.getBoundingClientRect().height - margin - 4;
      // 短い画面ではホイールを過度に縮めず、サイドバーをスクロールさせる。
      setWheelSize(Math.max(MIN_DESKTOP_WHEEL_SIZE, Math.floor(Math.min(216, container.clientWidth, available))));
    };
    fitWheel();
    const observer = new ResizeObserver(fitWheel);
    observer.observe(container);
    observer.observe(sidebar);
    observer.observe(sliders);
    siblings.forEach((child) => observer.observe(child));
    mobileLayout.addEventListener('change', fitWheel);
    return () => {
      observer.disconnect();
      mobileLayout.removeEventListener('change', fitWheel);
    };
  }, []);

  const [value, setValue] = useState(() => hsvToHex(hsv));
  const [renderedHsv, setRenderedHsv] = useState(hsv);
  const lastValue = useRef(value);
  if (hsv !== renderedHsv) {
    setRenderedHsv(hsv);
    setValue(hsvToHex(hsv));
  }
  const handleValueChange = (next: string) => {
    setValue(next); lastValue.current = next;
    const color = colorFromHex(next);
    if (color) onPreview?.(color.hsv);
  };
  const commit = () => { const color = colorFromHex(lastValue.current); if (color) onChange(color.hsv); };
  return <div ref={containerRef} className={styles.libraryPicker} onPointerUp={commit}>
    <ColorWheel.Root value={value} onValueChange={handleValueChange}>
      {/* カラーホイール本体 */}
      <ColorWheel.Wheel className={styles.wheel} size={wheelSize} ringWidth={Math.round(wheelSize / 10)}>
        <ColorWheel.HueRing />
        <ColorWheel.HueThumb />
        <ColorWheel.Area />
        <ColorWheel.AreaThumb />
      </ColorWheel.Wheel>

      {/* 各種スライダー */}
      <div ref={slidersRef} className={styles.sliders}>
        <ColorWheel.HueSlider className={styles.slider} />
        <ColorWheel.SaturationSlider className={styles.slider} />
        <ColorWheel.BrightnessSlider className={styles.slider} />
      </div>
    </ColorWheel.Root>
  </div>;
}
