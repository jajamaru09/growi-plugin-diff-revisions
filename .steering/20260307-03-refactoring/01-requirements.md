# 01-requirements.md

## 概要

複数回の機能追加・試行錯誤で蓄積された不要コード・重複・肥大化を整理するリファクタリング。

## リファクタリング項目

### 1. diffEngine.ts の中間層削除
- `computeBlockDiff` をラップしているだけの不要な中間ファイル
- `DiffResult` 型が `blockDiffEngine.ts` と重複
- 削除し、DiffModal.tsx から blockDiffEngine を直接インポート

### 2. htmldiff-js.d.ts の削除
- htmldiff-js はブロック差分方式への移行で不要になった型定義ファイル

### 3. LCS アルゴリズムの共通化
- `syncScrollUtils.ts` と `blockDiffEngine.ts` に同パターンの LCS 実装が重複
- 汎用 LCS 関数を共通ユーティリティとして切り出し

### 4. DiffModal.tsx のロジック分離
- 277行のファイルにモーダルUI、リビジョンナビゲーション、差分計算、キーイベント処理が混在
- リビジョンナビゲーションロジックをカスタムフック `useRevisionNavigation` に切り出し

### 5. htmldiff-js パッケージ依存の削除
- package.json から未使用の htmldiff-js を削除

## 受け入れ条件

1. 既存の動作が一切変わらないこと
2. 不要ファイル・不要依存が削除されていること
3. 重複コードが共通化されていること
4. DiffModal.tsx の見通しが改善されていること
