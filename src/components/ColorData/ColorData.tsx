import { useEffect, useRef, useState } from 'react';
import type { Color, HSV } from '@/types/color';
import { colorFromHsv, colorFromRgb } from '@/utils/color';
import { Copy } from 'lucide-react';
import styles from './ColorData.module.css';

type ColorDataProps = { color: Color; onChange?: (color: Color) => void };
const toHexInput = (hex: string) => hex.toUpperCase();

export default function ColorData({ color, onChange }: ColorDataProps) {
  const dirty = useRef({ rgb: false, hsv: false });
  const [copyStatus, setCopyStatus] = useState('');
  const [hex, setHex] = useState(toHexInput(color.hex));
  const [rgb, setRgb] = useState({ r: String(color.rgb.r), g: String(color.rgb.g), b: String(color.rgb.b) });
  const [hsv, setHsv] = useState({ h: String(Math.round(color.hsv.h)), s: String(Math.round(color.hsv.s * 100)), v: String(Math.round(color.hsv.v * 100)) });

  useEffect(() => {
    dirty.current = { rgb: false, hsv: false };
    setHex(toHexInput(color.hex));
    setRgb({ r: String(color.rgb.r), g: String(color.rgb.g), b: String(color.rgb.b) });
    setHsv({ h: String(Math.round(color.hsv.h)), s: String(Math.round(color.hsv.s * 100)), v: String(Math.round(color.hsv.v * 100)) });
  }, [color]);

  const emitRgb = (next: Partial<typeof rgb>) => {
    dirty.current.rgb = true;
    setRgb((current) => ({ ...current, ...next }));
  };
  const emitHsv = (next: Partial<typeof hsv>) => {
    dirty.current.hsv = true;
    setHsv((current) => ({ ...current, ...next }));
  };
  const commitRgb = () => {
    if (!dirty.current.rgb) return;
    dirty.current.rgb = false;
    const parsed = { r: Number(rgb.r), g: Number(rgb.g), b: Number(rgb.b) };
    const valid = Object.values(rgb).every((value) => value.trim() !== '')
      && Object.values(parsed).every((value) => Number.isFinite(value) && value >= 0 && value <= 255);
    if (valid) {
      onChange?.(colorFromRgb(parsed));
    } else {
      setRgb({ r: String(color.rgb.r), g: String(color.rgb.g), b: String(color.rgb.b) });
    }
  };
  const commitHsv = () => {
    if (!dirty.current.hsv) return;
    dirty.current.hsv = false;
    const parsed: HSV = { h: Number(hsv.h), s: Number(hsv.s) / 100, v: Number(hsv.v) / 100 };
    const valid = Object.values(hsv).every((value) => value.trim() !== '')
      && Object.values(parsed).every(Number.isFinite)
      && parsed.h >= 0 && parsed.h <= 360
      && parsed.s >= 0 && parsed.s <= 1 && parsed.v >= 0 && parsed.v <= 1;
    if (valid) {
      onChange?.(colorFromHsv(parsed));
    } else {
      setHsv({ h: String(Math.round(color.hsv.h)), s: String(Math.round(color.hsv.s * 100)), v: String(Math.round(color.hsv.v * 100)) });
    }
  };
  const emitHex = (value: string) => {
    const next = value.toUpperCase(); setHex(next);
    if (/^#[0-9A-F]{6}$/.test(next)) onChange?.(colorFromRgb({ r: Number.parseInt(next.slice(1, 3), 16), g: Number.parseInt(next.slice(3, 5), 16), b: Number.parseInt(next.slice(5, 7), 16) }));
  };
  const numberInput = (label: string, value: string, onValue: (value: string) => void, min: number, max: number, onCommit: () => void) => (
    <label className={styles.field}>
      <span>{label}</span>
      <input
        type="number" value={value} min={min} max={max} step="any"
        onChange={(event) => onValue(event.target.value)}
        onBlur={onCommit}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
      />
    </label>
  );
  const copy = async (format: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus(`${format}をコピーしました`);
    } catch {
      setCopyStatus('コピーできませんでした');
    }
  };
  const copyButton = (format: string, value: string) => (
    <button
      className={styles.copyButton}
      type="button"
      title={`${format}をコピー`}
      aria-label={`${format}をコピー`}
      onClick={() => { void copy(format, value); }}
    >
      <Copy size={18} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );

  return <section className={styles.data} aria-label="選択中の色">
    <div aria-label={`選択色 ${color.hex}`} className={styles.swatch} style={{ backgroundColor: color.hex }} />
    <div className={styles.groups}>
      <div className={styles.hexRow}>
        <label className={styles.field}>
          <span>HEX</span>
          <input className={styles.hexInput} value={hex} maxLength={7} spellCheck={false} onChange={(event) => emitHex(event.target.value)} />
        </label>
        {copyButton('HEX', color.hex.toUpperCase())}
      </div>
      <fieldset className={styles.group}>
        <legend>RGB</legend>
        <div className={styles.valueRow}>
          {numberInput('R', rgb.r, (value) => emitRgb({ r: value }), 0, 255, commitRgb)}
          {numberInput('G', rgb.g, (value) => emitRgb({ g: value }), 0, 255, commitRgb)}
          {numberInput('B', rgb.b, (value) => emitRgb({ b: value }), 0, 255, commitRgb)}
          {copyButton('RGB', `rgb(${color.rgb.r},${color.rgb.g},${color.rgb.b})`)}
        </div>
      </fieldset>
      <fieldset className={styles.group}>
        <legend>HSV</legend>
        <div className={styles.valueRow}>
          {numberInput('H (°)', hsv.h, (value) => emitHsv({ h: value }), 0, 360, commitHsv)}
          {numberInput('S (%)', hsv.s, (value) => emitHsv({ s: value }), 0, 100, commitHsv)}
          {numberInput('V (%)', hsv.v, (value) => emitHsv({ v: value }), 0, 100, commitHsv)}
          {copyButton('HSV', `hsv(${Math.round(color.hsv.h)}, ${Math.round(color.hsv.s * 100)}%, ${Math.round(color.hsv.v * 100)}%)`)}
        </div>
      </fieldset>
    </div>
    <p className={styles.copyStatus} role="status">{copyStatus}</p>
  </section>;
}
