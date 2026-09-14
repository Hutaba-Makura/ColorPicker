import { useRef, useState } from 'react';
import type { ChangeEvent, PointerEvent } from 'react';
import type { Color } from '@/types/color';
import { colorFromRgb } from '@/utils/color';

type ImagePickerProps = {
  onColorPick: (color: Color) => void;
};

export default function ImagePicker({ onColorPick }: ImagePickerProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const loadImage = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) loadImage(file);
  };

  const handlePointerDown = (event: PointerEvent<HTMLImageElement>) => {
    const image = imageRef.current;
    if (!image || !image.complete) return;

    const rect = image.getBoundingClientRect();
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
    onColorPick(colorFromRgb({
      r: pixel[0] * alpha + background * (1 - alpha),
      g: pixel[1] * alpha + background * (1 - alpha),
      b: pixel[2] * alpha + background * (1 - alpha),
    }));
  };

  return (
    <section>
      <label>
        画像を選択
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFileChange} />
      </label>
      {imageUrl && (
        <img ref={imageRef} src={imageUrl} alt="色を選択する画像" onPointerDown={handlePointerDown} />
      )}
    </section>
  );
}
