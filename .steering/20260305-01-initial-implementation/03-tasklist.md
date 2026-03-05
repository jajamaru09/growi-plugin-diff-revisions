# 03-tasklist.md - 実装タスクリスト

## フェーズ1: プラグイン基盤 + ビルド環境

- [ ] T-01: `package.json` 作成（依存関係: react, typescript, vite, @growi/pluginkit, unified, remark系, rehype系, htmldiff-js）
- [ ] T-02: `tsconfig.json` / `tsconfig.node.json` 作成
- [ ] T-03: `vite.config.ts` 作成（manifest: true, preserveEntrySignatures: 'strict'）
- [ ] T-04: `.gitignore` 作成
- [ ] T-05: `src/types.ts` 作成（Revision, RevisionItem, RevisionAuthor 等の型定義）
- [ ] T-06: `src/pageContext.ts` 作成（URLからpageId・mode抽出）
- [ ] T-07: `src/growiNavigation.ts` 作成（Navigation APIによるページ遷移検知）
- [ ] T-08: `client-entry.tsx` 作成（activate/deactivate、pluginActivators登録）
- [ ] T-09: `npm install` 実行、`npm run build` でビルド成功確認

## フェーズ2: サイドバーボタン + モーダル骨格

- [ ] T-10: `src/sidebarMount.tsx` 作成（サイドバーへのReactルートマウント管理）
- [ ] T-11: `src/components/DiffButton.tsx` 作成（サイドバーボタン、クリックでモーダル開閉）
- [ ] T-12: `src/components/DiffModal.tsx` 作成（createPortal、左右分割レイアウト、Esc/背景クリック閉じ）
- [ ] T-13: ビルド確認

## フェーズ3: リビジョン取得 + ドロップダウン

- [ ] T-14: `src/growiApi.ts` 作成（revisions/list API呼び出し、offsetループで全件取得）
- [ ] T-15: `src/components/RevisionSelector.tsx` 作成（「#No - revisionId - YYYY/MM/DD HH:mm 更新者」形式ドロップダウン）
- [ ] T-16: DiffButton/DiffModalにリビジョン取得・選択状態管理を統合
- [ ] T-17: ビルド確認

## フェーズ4: Markdownレンダリング + CSS

- [ ] T-18: `src/markdownRenderer.ts` 作成（unified + remark-parse + remark-gfm + remark-rehype + rehype-sanitize + rehype-stringify）
- [ ] T-19: `src/components/DiffPanel.tsx` 作成（`.wiki` クラス付きdivにレンダリング済みHTML表示）
- [ ] T-20: DiffModalにDiffPanel統合、リビジョン選択時にレンダリング実行
- [ ] T-21: ビルド確認

## フェーズ5: 差分検出 + ハイライト

- [ ] T-22: `src/diffEngine.ts` 作成（htmldiff-jsラッパー、2つのHTMLから差分HTML生成）
- [ ] T-23: DiffPanelに差分ハイライト表示を統合（左: 削除=ピンク、右: 追加=緑）
- [ ] T-24: 差分ハイライト用CSSスタイル実装（ins→#e6ffec、del→#ffebe9）
- [ ] T-25: 全体ビルド確認、最終動作確認
