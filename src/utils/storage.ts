import type { Color, ColorHistoryItem } from '@/types/color';

const STORAGE_KEY = 'color-picker-history';
export const MAX_HISTORY_ITEMS = 15;

const isColor = (value: unknown): value is Color => {
  if (!value || typeof value !== 'object') return false;
  const color = value as Partial<Color>;
  return Boolean(color.rgb && color.hsv && typeof color.hex === 'string');
};

const isHistoryItem = (value: unknown): value is ColorHistoryItem => {
  if (!isColor(value)) return false;
  const item = value as Partial<ColorHistoryItem>;
  return typeof item.id === 'string' && typeof item.createdAt === 'number';
};

/** localStorageから色履歴を読み込む。壊れた値は空履歴として扱う。 */
export const loadColorHistory = (): ColorHistoryItem[] => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(isHistoryItem).slice(0, MAX_HISTORY_ITEMS)
      : [];
  } catch {
    return [];
  }
};

/** 色履歴をlocalStorageへ保存する。 */
export const saveColorHistory = (history: ColorHistoryItem[]): void => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(history.slice(0, MAX_HISTORY_ITEMS)),
    );
  } catch {
    // localStorageが利用できない環境では何もしない。
  }
};

/** 色を履歴の先頭へ追加する。重複色も許可する。 */
export const addColorHistory = (
  color: Color,
  history: ColorHistoryItem[] = loadColorHistory(),
): ColorHistoryItem[] => {
  const item: ColorHistoryItem = {
    ...color,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: Date.now(),
  };
  const nextHistory = [item, ...history].slice(0, MAX_HISTORY_ITEMS);
  saveColorHistory(nextHistory);
  return nextHistory;
};

/** 色履歴をすべて削除する。 */
export const clearColorHistory = (): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
};
