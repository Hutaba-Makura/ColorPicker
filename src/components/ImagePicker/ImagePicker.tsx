import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, PointerEvent, WheelEvent } from 'react';
import type { Color } from '@/types/color';
import { colorFromRgb } from '@/utils/color';
import styles from './ImagePicker.module.css';

type ImagePickerProps = {
  onColorPick: (color: Color) => void;
  onColorPreview?: (color: Color) => void;
};

export default function ImagePicker({ onColorPick, onColorPreview }: ImagePickerProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const pickingRef = useRef(false);

  useEffect(() => () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  const loadImage = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
    setZoom(1);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) loadImage(file);
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) loadImage(file);
  };

  const pickAt = (event: PointerEvent<HTMLImageElement>, commit: boolean) => {
    const image = imageRef.current;
    if (!image || !image.complete || !image.naturalWidth || !image.naturalHeight) return;
    const rect = image.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = ((event.clientX - rect.left) / rect.width) * image.naturalWidth;
    const y = ((event.clientY - rect.top) / rect.height) * image.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(image, 0, 0);
    const pixel = context.getImageData(
      Math.max(0, Math.min(image.naturalWidth - 1, Math.floor(x))),
      Math.max(0, Math.min(image.naturalHeight - 1, Math.floor(y))),
      1,
      1,
    ).data;
    const alpha = pixel[3] / 255;
    const background = 255;
    const color = colorFromRgb({
      r: pixel[0] * alpha + background * (1 - alpha),
      g: pixel[1] * alpha + background * (1 - alpha),
      b: pixel[2] * alpha + background * (1 - alpha),
    });
    if (commit) onColorPick(color);
    else onColorPreview?.(color);
  };

  const handlePointerDown = (event: PointerEvent<HTMLImageElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    pickingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    pickAt(event, false);
  };

  const handlePointerMove = (event: PointerEvent<HTMLImageElement>) => {
    if (!pickingRef.current) return;
    event.preventDefault();
    pickAt(event, false);
  };

  const handlePointerUp = (event: PointerEvent<HTMLImageElement>) => {
    if (!pickingRef.current) return;
    event.preventDefault();
    pickAt(event, true);
    pickingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerCancel = (event: PointerEvent<HTMLImageElement>) => {
    pickingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey && !event.shiftKey) return;
    event.preventDefault();
    setZoom((value) => Math.max(0.25, Math.min(4, value * (event.deltaY < 0 ? 1.1 : 0.9))));
  };

  return (
    <section className={styles.picker} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
      <label>
        画像を選択
        <input className={styles.input} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFileChange} />
      </label>
      {imageUrl && (
        <>
          <div className={styles.viewport} onWheel={handleWheel}>
            <img
              className={styles.image}
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
              ref={imageRef}
              src={imageUrl}
              alt="画像から色を選択"
              draggable={false}
              onDragStart={(event) => event.preventDefault()}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            />
          </div>
          <label>
            拡大率
            <input type="range" min="0.25" max="4" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
            {' '}{Math.round(zoom * 100)}%
          </label>
        </>
      )}
    </section>
  );
}

