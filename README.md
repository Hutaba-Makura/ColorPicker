# ColorPicker

画像から色を抽出できるカラーピッカーWebアプリです。画像内をクリック(またはズームして精密に選択)して色を拾い、HSVカラーホイールでの微調整、HEX/RGB/HSVでの表示・コピー、選択履歴の確認ができます。

## 主な機能

- **画像からの色抽出** — 画像をアップロードし、ズームイン/アウトしながら任意のピクセルの色をピックアップ
- **カラーホイール** — HSVリング形式のカラーホイールで色相・彩度・明度を直感的に調整
- **カラー情報表示** — HEX / RGB / HSV 値の表示とワンクリックコピー
- **選択履歴** — 過去に選択した色を一覧から再選択

## 技術スタック

- [React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [culori](https://github.com/Evercoder/culori) — 色空間の変換処理
- [react-hsv-ring](https://github.com/usapopopooon/react-hsv-ring) — HSVカラーホイールコンポーネント
- [lucide-react](https://lucide.dev/) — UIアイコン

## セットアップ

```bash
npm install
npm run dev
```

## スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 型チェック後に本番ビルド |
| `npm run lint` | ESLintによる静的解析 |
| `npm run preview` | ビルド成果物をローカルでプレビュー |

## クレジット

- カラーホイールUIに [react-hsv-ring](https://github.com/usapopopooon/react-hsv-ring) を使用しています。
- 一部アイコンに [line-md](https://github.com/cyberalien/line-md) を使用しています。

## ライセンス

このプロジェクトは [MIT License](./LICENSE) のもとで公開されています。
