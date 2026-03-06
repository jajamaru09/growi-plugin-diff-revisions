# small-modification-memo.md

## 要求（01-requirements 相当）

Markdown差分モードで、削除行の右側（空）と追加行の左側（空）にグレー背景のパディング行を表示し、共通行の出現位置を左右で一致させる。Growiの標準更新履歴比較画面と同じ挙動。

## 設計（02-design 相当）

**変更箇所:** `src/components/MarkdownDiffPanel.tsx` の `ROW_COLORS` 定数

- `removed` タイプ: `rightBg` を `transparent` → グレー(`#f0f0f0`) に変更
- `added` タイプ: `leftBg` を `transparent` → グレー(`#f0f0f0`) に変更
- `removed` タイプ: `rightNumBg` も同様にグレーに変更
- `added` タイプ: `leftNumBg` も同様にグレーに変更

## タスク（03-tasklist 相当）

- [x] MarkdownDiffPanel.tsx の ROW_COLORS でパディング側の背景色をグレーに変更
