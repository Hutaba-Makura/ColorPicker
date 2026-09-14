/** RGB各成分。各値は0〜255の範囲。 */
export type RGB = {
  r: number;
  g: number;
  b: number;
};

/** HSV各成分。Hは0〜360、S/Vは0〜1の範囲。 */
export type HSV = {
  h: number;
  s: number;
  v: number;
};

/** 画面上で扱う色の基本情報。アルファ値は扱わない。 */
export type Color = {
  rgb: RGB;
  hsv: HSV;
  hex: string;
};

/** 履歴に保存する色。重複色も別項目として保存できるようIDと日時を持つ。 */
export type ColorHistoryItem = Color & {
  id: string;
  createdAt: number;
};

/** 画像上の座標。表示倍率ではなく、元画像の座標を表す。 */
export type ImagePoint = {
  x: number;
  y: number;
};

/** 読み込んだ画像の表示情報。 */
export type LoadedImage = {
  source: HTMLImageElement;
  width: number;
  height: number;
};

/** HSVカラーサークル操作で選択された位置。 */
export type ColorCircleSelection = {
  hue: number;
  saturation: number;
  value: number;
};
