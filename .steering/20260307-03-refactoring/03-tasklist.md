# 03-tasklist.md

## タスクリスト

- [x] `src/lcs.ts` を新規作成（汎用 LCS 関数）
- [x] `src/blockDiffEngine.ts` の LCS 部分を `lcs.ts` に委譲
- [x] `src/syncScrollUtils.ts` の LCS 部分を `lcs.ts` に委譲
- [x] `src/useRevisionNavigation.ts` を新規作成（リビジョンナビゲーションフック）
- [x] `src/components/DiffModal.tsx` からナビゲーションロジックを切り出し、import変更（diffEngine → blockDiffEngine）
- [x] `src/diffEngine.ts` を削除
- [x] `src/htmldiff-js.d.ts` を削除
- [x] `package.json` から `htmldiff-js` を削除
- [x] ビルド確認
