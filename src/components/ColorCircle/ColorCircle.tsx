import { useEffect, useRef, useState } from 'react';
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

export default function ColorCircle({ hsv, onPreview, onChange }: ColorCircleProps) {
  const [value, setValue] = useState(hsvToHex(hsv));
  const lastValue = useRef(value);
  useEffect(() => setValue(hsvToHex(hsv)), [hsv]);
  const handleValueChange = (next: string) => {
    setValue(next); lastValue.current = next;
    const color = colorFromHex(next);
    if (color) onPreview?.(color.hsv);
  };
  const commit = () => { const color = colorFromHex(lastValue.current); if (color) onChange(color.hsv); };
  return <div className={styles.libraryPicker} onPointerUp={commit}>
    <ColorWheel.Root value={value} onValueChange={handleValueChange}>
      {/* カラーホイール本体 */}
      <ColorWheel.Wheel size={240} ringWidth={24}>
        <ColorWheel.HueRing />
        <ColorWheel.HueThumb />
        <ColorWheel.Area />
        <ColorWheel.AreaThumb />
      </ColorWheel.Wheel>

      {/* 各種スライダー */}
      <div className="mt-4 flex flex-col gap-3">
        <ColorWheel.HueSlider className="w-full" />
        <ColorWheel.SaturationSlider className="w-full" />
        <ColorWheel.BrightnessSlider className="w-full" />
      </div>

      {/* 色の表示とHEX入力 */}
      <div className="mt-4 flex items-center gap-3">
        <ColorWheel.Swatch className="h-8 w-8 rounded border" />
        <ColorWheel.HexInput className="w-24 rounded border px-2 py-1" />
        <ColorWheel.CopyButton className="rounded border px-2 py-1">Copy</ColorWheel.CopyButton>
      </div>
    </ColorWheel.Root>
  </div>;
}
