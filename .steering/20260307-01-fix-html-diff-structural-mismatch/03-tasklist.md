# 03-tasklist.md

## タスクリスト

- [x] `src/diffEngine.ts` に `isHighlightOnly` ヘルパー関数を追加（`<li>` 要素の内容がすべてハイライトタグのみかを判定）
- [x] `src/diffEngine.ts` に `cleanStructuralArtifacts` 関数を追加（DOMParser でリスト構造のアーティファクトを除去）
- [x] `computeDiff` 内の処理パイプラインに `cleanStructuralArtifacts` を組み込む（左パネル: `'del'`、右パネル: `'ins'`）
- [ ] 動作確認: リスト構造が片方のみに存在する場合、反対側パネルにリストが表示されないこと
