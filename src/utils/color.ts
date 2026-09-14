export const RGB2HSV = (RGBColor: RGB)
import { converter, formatHex } from 'culori';
import type { Color, HSV, RGB } from '@/types/color';

const toHsv = converter('hsv');
const toRgb = converter('rgb');

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const normalizeHue = (hue: number): number => {
  const normalized = hue % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

/** RGB値を正規化する。 */
export const normalizeRgb = (rgb: RGB): RGB => ({
  r: Math.round(clamp(rgb.r, 0, 255)),
  g: Math.round(clamp(rgb.g, 0, 255)),
  b: Math.round(clamp(rgb.b, 0, 255)),
});

/** HSV値を正規化する。 */
export const normalizeHsv = (hsv: HSV): HSV => ({
  h: normalizeHue(hsv.h),
  s: clamp(hsv.s, 0, 1),
  v: clamp(hsv.v, 0, 1),
});

/** RGBからHSVへ変換する。 */
export const rgbToHsv = (rgb: RGB): HSV => {
  const value = toHsv({
    mode: 'rgb',
    r: clamp(rgb.r, 0, 255) / 255,
    g: clamp(rgb.g, 0, 255) / 255,
    b: clamp(rgb.b, 0, 255) / 255,
  });

  return normalizeHsv({
    h: value?.h ?? 0,
    s: value?.s ?? 0,
    v: value?.v ?? 0,
  });
};

/** HSVからRGBへ変換する。 */
export const hsvToRgb = (hsv: HSV): RGB => {
  const value = toRgb({ mode: 'hsv', ...normalizeHsv(hsv) });

  return normalizeRgb({
    r: (value?.r ?? 0) * 255,
    g: (value?.g ?? 0) * 255,
    b: (value?.b ?? 0) * 255,
  });
};

/** RGBから#RRGGBB形式のHEXへ変換する。 */
export const rgbToHex = (rgb: RGB): string =>
  formatHex({
    mode: 'rgb',
    r: normalizeRgb(rgb).r / 255,
    g: normalizeRgb(rgb).g / 255,
    b: normalizeRgb(rgb).b / 255,
  });

/** HSVから完全な色情報を生成する。 */
export const colorFromHsv = (hsv: HSV): Color => {
  const normalizedHsv = normalizeHsv(hsv);
  const rgb = hsvToRgb(normalizedHsv);

  return { rgb, hsv: normalizedHsv, hex: rgbToHex(rgb) };
};

/** RGBから完全な色情報を生成する。 */
export const colorFromRgb = (rgb: RGB): Color => {
  const normalizedRgb = normalizeRgb(rgb);

  return {
    rgb: normalizedRgb,
    hsv: rgbToHsv(normalizedRgb),
    hex: rgbToHex(normalizedRgb),
  };
};
