# 02-design.md - 実装設計

## 実装アプローチ

参考リポジトリ（growi-plugin-all-seen-users）と同じアーキテクチャパターンを踏襲し、差分比較機能として再構成する。

### フェーズ分割

1. **フェーズ1: プラグイン基盤 + ビルド環境**
   - package.json、tsconfig.json、vite.config.ts、client-entry.tsxの構築
   - Navigation APIによるページ遷移検知

2. **フェーズ2: サイドバーボタン + モーダル骨格**
   - サイドバーへのボタンマウント
   - モーダルの基本UI（開閉、左右分割レイアウト）

3. **フェーズ3: リビジョン取得 + ドロップダウン**
   - GROWI APIからリビジョン一覧取得（offsetループ対応）
   - リビジョン選択ドロップダウンUI

4. **フェーズ4: Markdownレンダリング + CSS**
   - unified/remark/rehypeによるMarkdown→HTML変換
   - `.wiki` クラスによるGROWI CSS継承

5. **フェーズ5: 差分検出 + ハイライト**
   - htmldiff-jsによるHTML差分検出
   - 淡いピンク/緑のハイライトスタイル適用

## 変更するコンポーネント

初回実装のため全ファイルが新規作成。

### ルートファイル

| ファイル | 役割 |
|---|---|
| `client-entry.tsx` | プラグインエントリポイント。activate/deactivateを定義しpageChangeListenerを管理 |
| `package.json` | 依存関係・ビルドスクリプト定義 |
| `tsconfig.json` | TypeScript設定（ES2020、React JSX、strict） |
| `vite.config.ts` | Viteビルド設定（manifest、preserveEntrySignatures） |

### src/ ユーティリティ

| ファイル | 役割 |
|---|---|
| `src/types.ts` | 共通型定義（Revision、RevisionItem、RevisionAuthor等） |
| `src/pageContext.ts` | URLからpageIdとmodeを抽出。参考リポジトリと同等の実装 |
| `src/growiNavigation.ts` | Navigation APIでページ遷移を検知。参考リポジトリと同等の実装 |
| `src/growiApi.ts` | `/_api/v3/revisions/list` の呼び出し。offsetループで全件取得 |
| `src/sidebarMount.tsx` | サイドバーへのDiffButtonマウント管理（createRoot） |
| `src/markdownRenderer.ts` | unified + remark-parse + remark-gfm + remark-rehype + rehype-sanitize + rehype-stringify |
| `src/diffEngine.ts` | htmldiff-jsのラッパー。2つのHTML文字列を受け取り差分HTMLを返す |

### src/components/

| ファイル | 役割 |
|---|---|
| `DiffButton.tsx` | サイドバーボタン。クリックでDiffModalを開く。リビジョン取得もここで実行 |
| `DiffModal.tsx` | モーダル全体。createPortalでbodyにマウント。左右パネル配置、Esc/背景クリック閉じ |
| `RevisionSelector.tsx` | `<select>`ドロップダウン。「#No - revisionId - YYYY/MM/DD HH:mm 更新者」形式 |
| `DiffPanel.tsx` | 差分HTML表示パネル。`.wiki` クラス付きdivにdangerouslySetInnerHTMLで表示 |

## データ構造の変更

初回実装のため変更なし。`src/types.ts` に以下の型を定義：

```typescript
export interface RevisionAuthor {
  _id: string;
  name: string;
  username: string;
}

export interface Revision {
  _id: string;
  format: string;
  pageId: string;
  body: string;
  author: RevisionAuthor;
  origin?: string;
  hasDiffToPrev: boolean;
  createdAt: string;
}

export interface RevisionItem {
  revisionNo: number;
  revisionId: string;
  createdAt: Date;
  body: string;
  authorName: string;
}
```

## 影響範囲の分析

- 新規プラグインのため既存コードへの影響なし
- GROWIのDOM構造（サイドバーボタン配置先）に依存
  - `[data-testid="pageListButton"]` の親要素を探索してボタンを挿入

## 主要な実装判断

### Markdownレンダリング

unified パイプラインで処理する。GROWIの全プラグイン再現は不可能なため、基本GFM + サニタイズで実用的なレンダリングを目指す。

```
markdown → remark-parse → remark-gfm → remark-rehype → rehype-sanitize → rehype-stringify → HTML
```

### HTML差分検出

htmldiff-js を使用。2つのHTML文字列を比較し、`<ins>` / `<del>` タグで差分をマークアップする。プラグインCSS側でこれらに背景色を付与。

### モーダルの差分表示ロジック

- 左右それぞれで独立してリビジョンを選択
- 両方のリビジョンが選択された時点で差分を計算
- 左パネル: 削除箇所（淡いピンク）をハイライト
- 右パネル: 追加箇所（淡い緑）をハイライト

## 参考 URL

- https://github.com/jajamaru09/growi-plugin-all-seen-users
  - GROWIプラグインの基本構造（client-entry.tsx、sidebarMount.tsx、growiNavigation.ts）
  - `window.pluginActivators` によるライフサイクル管理パターン
  - サイドバーボタン挿入のDOM操作方法（`[data-testid="pageListButton"]` の親要素探索）
  - package.json の `growiPlugin` 設定（schemaVersion: 4、type: "script"）
  - Vite設定（manifest: true、preserveEntrySignatures: 'strict'）
