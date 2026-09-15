import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, PointerEvent } from 'react';
import type { Color } from '@/types/color';
import { colorFromRgb } from '@/utils/color';
import { ZoomIn, ZoomOut } from 'lucide-react';
import styles from './ImagePicker.module.css';

type ImagePickerProps = {
  onColorPick: (color: Color) => void;
  onColorPreview?: (color: Color) => void;
};

export default function ImagePicker({ onColorPick, onColorPreview }: ImagePickerProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const zoomOutputRef = useRef<HTMLOutputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [zoomPercent, setZoomPercent] = useState(100);
  const zoom = zoomPercent / 100;
  const pickingRef = useRef(false);

  useLayoutEffect(() => {
    // outputの表示はネイティブvalue経由で同期し、JSXの子テキストと二重管理しない。
    if (zoomOutputRef.current) {
      zoomOutputRef.current.value = `${zoomPercent}%`;
    }
  }, [zoomPercent, imageUrl]);

  const updateZoomFromRange = (value: number) => {
    if (Number.isFinite(value)) {
      setZoomPercent(Math.max(25, Math.min(400, Math.round(value))));
    }
  };

  useEffect(() => () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  const loadImage = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
    setZoomPercent(100);
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

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !imageUrl) return;

    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.shiftKey) return;
      // Reactのwheelイベントではブラウザ側のズームを抑止できない場合がある。
      event.preventDefault();
      if (event.deltaY === 0) return;
      setZoomPercent((value) => Math.max(25, Math.min(400,
        Math.round(value * (event.deltaY < 0 ? 1.1 : 0.9)),
      )));
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [imageUrl]);

  return (
    <section className={styles.picker} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
      <label className={styles.inputLabel}>
        <input ref={inputRef} aria-label="画像を選択" className={styles.input} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFileChange} />
      </label>
      <div ref={viewportRef} className={`${styles.viewport} ${imageUrl ? '' : styles.emptyViewport}`}>
        {imageUrl ? (
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
        ) : (
          <div className={styles.emptyContent}>
            <p>画像をここにドラッグ＆ドロップ</p>
            <button type="button" className={styles.selectButton} onClick={() => inputRef.current?.click()}>画像を選択</button>
            <span>PNG・JPEG・WebP・GIF</span>
          </div>
        )}
      </div>
      {imageUrl && (
          <div className={styles.zoomControls} role="group" aria-label="画像の拡大率">
            <button className={styles.zoomButton} type="button" aria-label="縮小" onClick={() => setZoomPercent((value) => Math.max(25, value - 10))}>
              <ZoomOut size={22} aria-hidden="true" />
            </button>
            <input
              className={styles.zoomRange}
              aria-label="拡大率"
              type="range"
              min="25"
              max="400"
              step="1"
              value={zoomPercent}
              aria-valuetext={`${zoomPercent}%`}
              onInput={(event) => updateZoomFromRange(event.currentTarget.valueAsNumber)}
              onChange={(event) => updateZoomFromRange(event.currentTarget.valueAsNumber)}
            />
            <button className={styles.zoomButton} type="button" aria-label="拡大" onClick={() => setZoomPercent((value) => Math.min(400, value + 10))}>
              <ZoomIn size={22} aria-hidden="true" />
            </button>
            <output ref={zoomOutputRef} className={styles.zoomOutput} aria-label="現在の拡大率" translate="no" />
          </div>
      )}
    </section>
  );
}
