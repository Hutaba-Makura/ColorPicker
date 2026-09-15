import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  const zoomRef = useRef(100);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const zoomAnchor = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const fitScale = imageSize.width && imageSize.height && viewportSize.width && viewportSize.height
    ? Math.min(viewportSize.width / imageSize.width, viewportSize.height / imageSize.height)
    : 1;
  const imageWidth = imageSize.width * fitScale * zoom;
  const imageHeight = imageSize.height * fitScale * zoom;

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const measure = () => {
      const width = viewport.clientWidth;
      const height = viewport.clientHeight;
      setViewportSize((current) => current.width === width && current.height === height
        ? current : { width, height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !imageWidth || !imageHeight) return;
    const anchor = zoomAnchor.current;
    if (anchor) {
      viewport.scrollLeft = viewportSize.width + anchor.x * imageWidth - anchor.offsetX;
      viewport.scrollTop = viewportSize.height + anchor.y * imageHeight - anchor.offsetY;
    } else {
      viewport.scrollLeft = (viewportSize.width + imageWidth) / 2;
      viewport.scrollTop = (viewportSize.height + imageHeight) / 2;
    }
    zoomAnchor.current = null;
  }, [imageWidth, imageHeight, viewportSize.width, viewportSize.height]);

  useLayoutEffect(() => {
    // outputの表示はネイティブvalue経由で同期し、JSXの子テキストと二重管理しない。
    if (zoomOutputRef.current) {
      zoomOutputRef.current.value = `${zoomPercent}%`;
    }
  }, [zoomPercent, imageUrl]);

  const changeZoom = useCallback((value: number, point?: { clientX: number; clientY: number }) => {
    if (!Number.isFinite(value)) return;
    const next = Math.max(25, Math.min(400, Math.round(value)));
    if (next === zoomRef.current) return;
    const viewport = viewportRef.current;
    const image = imageRef.current;
    if (viewport && image) {
      const bounds = viewport.getBoundingClientRect();
      const imageBounds = image.getBoundingClientRect();
      const left = bounds.left + viewport.clientLeft;
      const top = bounds.top + viewport.clientTop;
      const clientX = point?.clientX ?? left + viewport.clientWidth / 2;
      const clientY = point?.clientY ?? top + viewport.clientHeight / 2;
      if (imageBounds.width && imageBounds.height) {
        zoomAnchor.current = {
          x: (clientX - imageBounds.left) / imageBounds.width,
          y: (clientY - imageBounds.top) / imageBounds.height,
          offsetX: clientX - left,
          offsetY: clientY - top,
        };
      }
    }
    zoomRef.current = next;
    setZoomPercent(next);
  }, []);

  useEffect(() => () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  const loadImage = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageUrl(URL.createObjectURL(file));
    setImageSize({ width: 0, height: 0 });
    zoomAnchor.current = null;
    zoomRef.current = 100;
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
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1;
      const deltaY = event.deltaY * unit;
      const deltaX = event.deltaX * unit;
      if (event.ctrlKey) {
        if (deltaY) changeZoom(zoomRef.current + (deltaY < 0 ? 20 : -20), event);
      } else if (event.shiftKey) {
        viewport.scrollLeft += deltaY || deltaX;
      } else {
        viewport.scrollTop += deltaY;
        viewport.scrollLeft += deltaX;
      }
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [imageUrl, changeZoom]);

  return (
    <section className={styles.picker} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
      <label className={styles.inputLabel}>
        <input ref={inputRef} aria-label="ファイルを選択" className={styles.input} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFileChange} />
      </label>
      <div ref={viewportRef} className={`${styles.viewport} ${imageUrl ? '' : styles.emptyViewport}`}>
        {imageUrl ? (
          <div className={styles.imageCanvas} style={{ width: imageWidth + viewportSize.width * 2, height: imageHeight + viewportSize.height * 2 }}>
            <img
              className={styles.image}
              style={{ width: imageWidth || 1, height: imageHeight || 1, left: viewportSize.width, top: viewportSize.height, visibility: imageSize.width ? 'visible' : 'hidden' }}
              ref={imageRef}
              src={imageUrl}
              onLoad={(event) => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
              alt="画像から色を選択"
              draggable={false}
              onDragStart={(event) => event.preventDefault()}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            />
          </div>
        ) : (
          <div className={styles.emptyContent}>
            <button type="button" className={styles.selectButton} onClick={() => inputRef.current?.click()}>画像を選択</button>
            <span>PNG・JPEG・WebP・GIF</span>
          </div>
        )}
      </div>
      {imageUrl && (
          <div className={styles.zoomControls} role="group" aria-label="画像の拡大率">
            <button className={styles.zoomButton} type="button" aria-label="縮小" onClick={() => changeZoom(zoomRef.current - 10)}>
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
              onInput={(event) => changeZoom(event.currentTarget.valueAsNumber)}
              onChange={(event) => changeZoom(event.currentTarget.valueAsNumber)}
            />
            <button className={styles.zoomButton} type="button" aria-label="拡大" onClick={() => changeZoom(zoomRef.current + 10)}>
              <ZoomIn size={22} aria-hidden="true" />
            </button>
            <output ref={zoomOutputRef} className={styles.zoomOutput} aria-label="現在の拡大率" translate="no" />
          </div>
      )}
    </section>
  );
}
