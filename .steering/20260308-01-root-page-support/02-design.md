# 02-design.md

## 実装アプローチ

ルートページ `/` を特別なケースとして扱い、pageIdが不明な状態でもボタンをマウントし、ボタン押下時にAPIからpageIdを解決する。

### 方針

pageIdが不明な場合は特殊な値（空文字列）をpageIdとしてDiffButtonに渡す。DiffButton側でpageIdが空の場合はボタン押下時にAPIからpageIdを取得してから通常フローに合流する。

## 変更するコンポーネント

### 1. `src/pageContext.ts`

- `isPageIdUrl` を修正し、パス `/` も有効なページとして認識させる
- 新関数 `isRootPage(pathname: string): boolean` を追加

### 2. `src/growiNavigation.ts`

- `buildContext` を修正し、ルートページの場合は `pageId` を空文字列としたコンテキストを返す

### 3. `src/growiApi.ts`

- 新関数 `fetchPageIdByPath(path: string): Promise<string>` を追加
- `/_api/v3/page/?path={path}` にアクセスし、`page._id` を返す

### 4. `src/components/DiffButton.tsx`

- `pageId` が空文字列の場合、ボタン押下時に `fetchPageIdByPath('/')` を呼び出してpageIdを解決
- 解決後のpageIdでリビジョン取得を実行
- API失敗時はエラーメッセージを表示

## データフロー

```
ルートページ `/` にアクセス
  ↓
pageContext.ts: isRootPage('/') → true, isPageIdUrl('/') → true
  ↓
growiNavigation.ts: buildContext → { pageId: '', mode: 'view' }
  ↓
client-entry.tsx: mountOrUpdate('') → DiffButton に pageId='' を渡す
  ↓
ボタン押下時:
  pageId === '' → fetchPageIdByPath('/') → 実際のpageIdを取得
  ↓
fetchAllRevisions(resolvedPageId) → 通常フロー
```

## 影響範囲の分析

- 通常ページ: `isPageIdUrl` の既存ロジックはそのまま動作。pageIdが24文字hex文字列の場合は従来通り
- ルートページ: 新たにボタンが表示される。ボタン押下時にAPI呼び出しが1回追加
- DiffModal: `pageId` propに解決済みのpageIdが渡されるため変更不要

## 参考 URL

- Growi REST API: `/_api/v3/page/?path=/` — パスからページ情報を取得するエンドポイント
  - レスポンスの `page._id` がpageId
  - 認証済みユーザーのみアクセス可能
