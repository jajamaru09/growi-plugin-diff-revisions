# 03-tasklist.md

## タスクリスト

### Task 1: `remark-directive` パッケージの追加
- [x] `package.json` の dependencies に `remark-directive` を追加
- [x] `npm install` で依存関係をインストール

### Task 2: カスタムremarkプラグイン `remarkCallout.ts` の作成
- [x] `src/remarkCallout.ts` を新規作成
- [x] `containerDirective` ノードを検出し、calloutタイプに一致するか判定
- [x] 一致する場合、`data.hName = 'div'`、`data.hProperties` にcalloutクラスを設定
- [x] ラベル（directiveLabel）の抽出・デフォルトタイトル設定
- [x] callout-indicator と callout-content の子ノード構造を構築

### Task 3: `markdownRenderer.ts` のパイプライン更新
- [x] `remarkDirective` と `remarkCallout` をパイプラインに追加
- [x] `remarkRehype` に `allowDangerousHtml: true` を設定
- [x] `rehypeSanitize` のスキーマを拡張（callout関連のクラス・属性を許可）

### Task 4: `DiffPanel.tsx` にcalloutスタイル追加
- [x] `.callout` 基本スタイル（padding, margin, border-left）
- [x] タイプ別スタイル（`.callout-note`, `.callout-tip`, `.callout-important`, `.callout-info`, `.callout-warning`, `.callout-danger`, `.callout-caution`）
- [x] `.callout-indicator`, `.callout-title`, `.callout-content` のスタイル

### Task 5: `blockDiffEngine.ts` のブロック認識更新
- [x] calloutクラスを持つ `div` をブロック要素として認識する処理を追加

### Task 6: 動作確認
- [x] ビルドが通ることを確認
- [x] callout構文を含むMarkdownが正しくHTMLにレンダリングされることを確認（全7タイプ検証済み）
