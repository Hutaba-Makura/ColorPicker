import type { PointerEvent } from 'react';
import type { HSV } from '@/types/color';
import styles from './ColorCircle.module.css';

type ColorCircleProps = { hsv: HSV; onChange: (hsv: HSV) => void };

export default function ColorCircle({ hsv, onChange }: ColorCircleProps) {
  const selectHue = (e: PointerEvent<HTMLDivElement>) => { const r = e.currentTarget.getBoundingClientRect(); const a = Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2); onChange({ ...hsv, h: (a * 180) / Math.PI + 90 }); };
  const selectSv = (e: PointerEvent<HTMLDivElement>) => { const r = e.currentTarget.getBoundingClientRect(); onChange({ ...hsv, s: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), v: Math.max(0, Math.min(1, 1 - (e.clientY - r.top) / r.height)) }); };
  return <div className={styles.picker}><div className={styles.hueRing} onPointerDown={selectHue} role="slider" aria-label="色相" /><div className={styles.svSquare} style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h} 100% 50%))` }} onPointerDown={selectSv} role="slider" aria-label="彩度と明度" /></div>;
}
