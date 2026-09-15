import { useCallback, useState } from 'react';
import type { Color, ColorHistoryItem } from '@/types/color';
import {
  addColorHistory,
  clearColorHistory,
  loadColorHistory,
} from '@/utils/storage';

export const useColorHistory = () => {
  const [history, setHistory] = useState<ColorHistoryItem[]>(loadColorHistory);

  const add = useCallback((color: Color) => {
    setHistory((current) => addColorHistory(color, current));
  }, []);

  const clear = useCallback(() => {
    clearColorHistory();
    setHistory([]);
  }, []);

  return { history, add, clear };
};
