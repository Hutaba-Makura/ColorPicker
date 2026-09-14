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
- (A-7)画面中央に画像、左上にColorCircle、その下にColorData、さらにその下にColorHistory
- (A-8)画像を1件読み込み、マウスで左クリックしてる間該当部の色をピックモードに、離すことで色を選択、モードの間カラーサークル、値表示部も連動