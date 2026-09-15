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
- Ctrl+マウスホイールの倍率変更幅は20パーセントポイント（100%→120%など）とする。上下限では範囲内に制限する。
- Shift+マウスホイールで、枠内を左右にスクロールする。
- Ctrl/Shiftを付けないマウスホイールで、枠内を上下にスクロールする。
- どの倍率でも画像を移動できるよう、画像周囲にスクロール用の余白を確保する。
- 縦横のスクロールバーを表示する。
- 画像表示部の下に拡大率を調整するバーを表示する。
- sidebarと画像枠のスクロールバーは、透明な背景・端の矢印なしの共通デザインにする。

### 対応端末

- PC（マウス操作）とスマートフォン（タッチ操作）を対象とする。

### スマートフォン表示と操作

- 幅1023px以下では、Logo → ImageArea → Sidebar → Xアカウントの順に縦に配置する。
- ページ全体を縦スクロールできるようにし、Sidebar内のスクロールは行わない。
- Viewportの高さは画面の約40%（40dvh）とする。
- 二本指の間隔を広げると拡大、狭めると縮小する。倍率は25%〜400%の範囲とする。
- 二本指の中点を基準に拡大・縮小し、二本指を動かして画像を移動できる。
- 一本指で画像の色をプレビューし、指を離した時に確定する。
- 二本指操作を行った場合、すべての指が離れるまで色の確定・履歴追加を行わない。

## 追加仕様

- カラーサークルは `react-hsv-ring` を使用する。
- RGB、HSV、HEXの各値は入力欄から編集できる。
- RGB、HSV、HEXにはコピー操作を用意する。
- RGBのコピー形式は `rgb(238,221,211)` とする。
- HSVのコピー形式は `hsv(336, 56%, 63%)` とする。
- HEXのコピー形式は空白を含まない `#EEDDD3` とする。
