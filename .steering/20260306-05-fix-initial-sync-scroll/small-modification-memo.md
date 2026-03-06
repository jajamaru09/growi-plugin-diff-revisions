# small-modification-memo.md

## 要求（01-requirements 相当）

モーダル起動時にスクロール連動が動作せず、トグルスイッチを一度切り替えないと連動が開始されないバグを修正する。

## 設計（02-design 相当）

**原因:** `useSyncScroll` フック内のスクロールリスナー登録 `useEffect` の依存配列が `[leftRef, rightRef, enabled]` のみだった。RefObject の参照は安定しているためマウント後に `.current` が埋まっても再実行されず、HTML描画完了時にリスナーが登録されなかった。

**修正方針:** スクロールリスナー登録の `useEffect` の依存配列に `leftHtml`, `rightHtml` を追加する。これにより HTML 描画完了時に `useEffect` が再実行され、ref が有効な状態でリスナーが登録される。

**変更箇所:** `src/useSyncScroll.ts` 69行目

## タスク（03-tasklist 相当）

- [x] `useSyncScroll.ts` のスクロールリスナー `useEffect` 依存配列に `leftHtml`, `rightHtml` を追加
