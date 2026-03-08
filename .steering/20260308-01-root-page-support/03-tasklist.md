# 03-tasklist.md

## タスクリスト

### 1. `src/pageContext.ts` の修正
- [ ] `isRootPage(pathname: string): boolean` 関数を追加（パスが `/` の場合に `true`）
- [ ] `isPageIdUrl` を修正し、ルートページも `true` を返すようにする
- [ ] `extractPageId` がルートページの場合 `null` を返す動作は維持（既存動作を壊さない）

### 2. `src/growiNavigation.ts` の修正
- [ ] `buildContext` を修正し、`isRootPage` の場合は `{ pageId: '', mode }` を返す

### 3. `src/growiApi.ts` の修正
- [ ] `fetchPageIdByPath(path: string): Promise<string>` 関数を追加
- [ ] `/_api/v3/page/?path={path}` を呼び出し、`page._id` を返す
- [ ] エラー時は例外をスローする

### 4. `src/components/DiffButton.tsx` の修正
- [ ] `handleOpen` を修正し、`pageId === ''` の場合に `fetchPageIdByPath('/')` で解決
- [ ] 解決したpageIdを状態として保持し、`fetchAllRevisions` と `DiffModal` に渡す
- [ ] API失敗時のエラーハンドリング

### 5. 動作確認
- [ ] ビルドが通ることを確認
- [ ] `docs/` 変更履歴の追記（乖離があれば）
