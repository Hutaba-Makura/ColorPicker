# 要件定義

## 概要
読み込ませた画像から色をピックする静的でシンプルなサイト
色の履歴機能やカラーサークル画面、現在選択している色をRGB、HSV、カラーコードで表示する機能を持っている
ドラックするとWebpやpngのような画像も読み込める、手動も可能

# 技術スタック

- React
- TypeScript
- Vite
- CSS Modules
- GitHub Pages
- GitHub Actions
- Canvas API
- File API
- Pointer Events
- localStorage
- culori
  - RGB / HSV / HEX などの色変換に使用
- react-hsv-ring
  - カラーウィールの実装に使用

# フォルダ構成

```text
src/
├── components/
│   ├── ColorCircle/
│   │   ├── ColorCircle.tsx
│   │   └── ColorCircle.module.css
│   ├── ColorData/
│   │   ├── ColorData.tsx
│   │   └── ColorData.module.css
│   ├── ColorHistory/
│   │   ├── ColorHistory.tsx
│   │   └── ColorHistory.module.css
│   └── ImagePicker/
│       ├── ImagePicker.tsx
│       └── ImagePicker.module.css
│
├── hooks/
│   ├── useColorPicker.ts
│   └── useColorHistory.ts
│
├── utils/
│   ├── color.ts
│   └── storage.ts
│
├── types/
│   └── color.ts
│
├── App.tsx
├── App.module.css
└── main.tsx

public/

.github/
└── workflows/
    └── deploy.yml

index.html
vite.config.ts
package.json
tsconfig.json
````

## 機能要件
- (A-1)静的な配信、軽量に
- (A-2)ログイン不要、履歴はlocalStorageで管理
- (A-3).png, .jpeg, .webpなど様々な画像形式に対応
- (A-4)*ColorHistory*: 色の履歴を20件表示、グリッド形式で、クリックするとその色を選択できる
- (A-5)*ColorData*: 現在選択している色のRGB、HSV、カラーコードを表示
- (A-6)*ColorCircle*: 現在選択している色をカラーサークル上に表示、またカラーサークルを弄ることで色の選択も可能
- (A-7)画面中央に画像、右上にColorCircle、その下にColorData、さらにその下にColorHistory
- (A-8)画像を1件読み込み、マウスで左クリックしてる間該当部の色をピックモードに、離すことで色を選択、モードの間カラーサークル、値表示部も連動

## 詳細な機能

### カラーサークル

- HSVを操作するカラーサークルを表示する。
- 外側の円で色相（Hue）を選択する。
- 内側の四角で彩度（Saturation）と明度（Value）を選択する。
- カラーサークル上で色を変更した場合、操作を確定した色を履歴に追加する。

### 色の履歴

- 色の確定時にのみ履歴へ追加する。
- 同じ色を再度確定した場合も、新しい履歴項目として追加する。
- 履歴から色を選択した場合も、その色を新しい履歴項目として追加する。

### 透明画像の扱い

- アルファ値は保持しない。
- 透明部分を背景色と合成した結果の色を取得する。

### 画像表示とズーム

- 画像は既定の表示枠内で、縦または横が枠いっぱいになるように表示する。
- Ctrl+マウスホイールで、マウスポインター位置を基準に拡大・縮小する。
- Shift+マウスホイールでも、マウスポインター位置を基準に拡大・縮小する。
- Ctrl/Shiftを付けないマウスホイールは、枠内のスクロールに使用する。
- 縦横のスクロールバーを表示する。
- 画像表示部の下に拡大率を調整するバーを表示する。

### 対応端末

- 初期リリースではPC（マウス操作）を対象とする。

## 追加仕様

- カラーサークルは `react-hsv-ring` を使用する。
- RGB、HSV、HEXの各値は入力欄から編集できる。
- RGB、HSV、HEXにはコピー操作を用意する。
- RGBのコピー形式は `rgb(238,221,211)` とする。
- HSVのコピー形式は `hsv(336, 56%, 63%)` とする。
- HEXのコピー形式は空白を含まない `#EEDDD3` とする。
