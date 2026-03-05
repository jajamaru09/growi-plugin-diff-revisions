# 02-design.md - 実装設計

## 実装アプローチ

RevisionSelectorにリビジョン閲覧リンクを追加する。

## 変更するコンポーネント

### 1. `src/components/RevisionSelector.tsx`

- 増減ボタンの横にリンクアイコン（`open_in_new`）を追加
- `<a>` タグで `target="_blank"` `rel="noopener noreferrer"` を指定
- 新しいprop: `pageId: string` — リンクURL生成に使用
- リンクURL形式: `/{pageId}?revision={revisionId}`（GROWIの特定リビジョン閲覧URL）
- リビジョン未選択時（`selectedId === ''`）はリンクを無効化（クリック不可・薄い表示）

### 2. `src/components/DiffModal.tsx`

- RevisionSelectorに `pageId` propを渡す
- 新しいprop: `pageId: string`

### 3. `src/components/DiffButton.tsx`

- DiffModalに `pageId` propを渡す（既にpropsにある）

## 影響範囲の分析

- RevisionSelector: prop追加 + リンクUI追加
- DiffModal: pageId propの受け渡し追加
- DiffButton: DiffModalへのpageId受け渡し追加

## docs/ への影響

- `02-functional-design.md`: RevisionSelectorの責務に「リビジョン閲覧リンク」が追加 → 変更履歴に追記

## 参考 URL

なし
