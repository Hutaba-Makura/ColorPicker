import { useCallback, useState } from 'react';
import type { Color, ImagePoint } from '@/types/color';
import { colorFromHsv } from '@/utils/color';

export const useColorPicker = (initialColor: Color = colorFromHsv({ h: 0, s: 0, v: 1 })) => {
  const [color, setColor] = useState<Color>(initialColor);
  const [imagePoint, setImagePoint] = useState<ImagePoint | null>(null);
  const [isPicking, setIsPicking] = useState(false);

  const selectColor = useCallback((nextColor: Color) => {
    setColor(nextColor);
  }, []);

  const selectFromHsv = useCallback((h: number, s: number, v: number) => {
    setColor(colorFromHsv({ h, s, v }));
  }, []);

  const startPicking = useCallback(() => {
    setIsPicking(true);
  }, []);

  const stopPicking = useCallback(() => {
    setIsPicking(false);
  }, []);

  const setPickedPoint = useCallback((point: ImagePoint | null) => {
    setImagePoint(point);
  }, []);

  return {
    color,
    imagePoint,
    isPicking,
    selectColor,
    selectFromHsv,
    startPicking,
    stopPicking,
    setPickedPoint,
  };
};
