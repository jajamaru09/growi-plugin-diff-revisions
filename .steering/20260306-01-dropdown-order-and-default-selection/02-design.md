# 02-design.md - 実装設計

## 実装アプローチ

2つの変更を2ファイルで対応する。

## 変更するコンポーネント

### 1. `src/components/RevisionSelector.tsx`

- ドロップダウンの表示順を降順に変更
- `revisions` 配列をスプレッドしてreverseし、最新（revisionNoが大きい）を先頭に表示
- revisionNoの値自体は変更しない（古い順に1から採番のまま）

### 2. `src/components/DiffModal.tsx`

- `leftId` / `rightId` の初期値を空文字からデフォルトリビジョンに変更
- リビジョン取得完了時（`revisions` propが更新された時）にデフォルト選択を設定
  - 右: `revisions[revisions.length - 1]`（最新、revisionNoが最大）
  - 左: `revisions[revisions.length - 2]`（最新-1）
  - リビジョンが1件の場合: 右のみ設定、左は空
  - リビジョンが0件の場合: 両方空

## 影響範囲の分析

- RevisionSelector: 表示順のみ変更、ロジックへの影響なし
- DiffModal: useEffectでrevisions変更時にデフォルト値を設定。既存の差分計算useEffectがleftId/rightId変更で発火するため、モーダル表示直後に差分が表示される

## 参考 URL

なし（既存コードの修正のみ）
