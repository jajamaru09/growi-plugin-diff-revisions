# 技術仕様書

## 1. テクノロジースタック

| カテゴリ | 技術 | バージョン | 用途 |
|---|---|---|---|
| 言語 | TypeScript | 5.5+ | 型安全な開発 |
| UI | React | 18.3+ | コンポーネントベースUI |
| ビルド | Vite | 5.4+ | バンドル・開発サーバー |
| プラグイン基盤 | @growi/pluginkit | 1.1+ | GROWIプラグインスキーマ準拠 |
| Markdownパーサー | unified / remark / rehype | 最新安定版 | Markdown→HTML変換 |
| GFM対応 | remark-gfm | 最新安定版 | テーブル・チェックボックス等 |
| HTML差分 | htmldiff-js | 最新安定版 | HTML差分検出・ハイライト生成 |

## 2. 開発ツールと手法

### 2.1 ビルドツール

- **Vite**: バンドルとHMR開発を担当
  - `vite.config.ts` で `manifest: true` を設定（GROWIがハッシュ付きファイル名を解決するため）
  - `preserveEntrySignatures: 'strict'` で `activate`/`deactivate` のエクスポートを保持
  - エントリポイント: `client-entry.tsx`

### 2.2 パッケージマネージャ

- npm

### 2.3 バージョン管理

- Git

## 3. 技術的制約と要件

### 3.1 GROWIプラグインシステムの制約

- スキーマバージョン: v4
- タイプ: script
- `window.pluginActivators` による activate/deactivate ライフサイクル
- ブラウザ上で動作（サーバーサイドコードなし）
- GROWIの内部モジュール（growiFacade等）は直接利用不可

### 3.2 Markdownレンダリングの制約

- GROWIのレンダリングパイプラインをプラグイン内で再現する必要がある
- GROWIが使用するremark/rehypeプラグインの完全な再現は困難なため、基本的なMarkdown（GFM）レンダリングを目標とする
- GROWI固有のディレクティブ（lsx等）は対応外とする
- CSSは既存の `.wiki` クラスを活用してGROWIと同等の見た目を実現

### 3.3 API制約

- `/_api/v3/revisions/list` の `limit` 上限は100
- 100件超のリビジョンは `offset` ループで取得
- 認証はGROWIのセッション（Cookie）を利用

### 3.4 ブラウザ互換性

- モダンブラウザ（Chrome、Firefox、Edge最新版）をサポート

## 4. パフォーマンス要件

| 指標 | 目標値 |
|---|---|
| リビジョン一覧取得 | 3秒以内 |
| Markdownレンダリング + 差分表示 | 5秒以内 |
| モーダル初期表示 | 1秒以内 |
| バンドルサイズ | 可能な限り小さく（remark/rehype依存のため監視） |
