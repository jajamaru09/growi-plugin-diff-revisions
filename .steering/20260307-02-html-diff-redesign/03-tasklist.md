# 03-tasklist.md

## タスクリスト

### Phase 1: ブロック抽出・マッチングエンジン
- [x] `src/blockDiffEngine.ts` を新規作成
- [x] `extractBlocks(html)` — DOMParser でブロック要素を抽出（p, h1-h6, li, blockquote, pre, table, hr）
- [x] `levenshteinSimilarity(a, b)` — テキスト類似度の計算
- [x] `matchBlocks(leftBlocks, rightBlocks)` — LCS ベースのブロックマッチング（type一致 + 類似度閾値0.3）

### Phase 2: ブロック内テキスト差分
- [x] `mergeShortMatches(parts, minLength)` — diffChars の結果で3文字未満の一致を隣接変更に吸収
- [x] `highlightTextDiff(leftHtml, rightHtml)` — ブロック内テキスト差分のハイライト挿入

### Phase 3: 最終HTML構築
- [x] `computeBlockDiff(leftHtml, rightHtml): DiffResult` — メインエントリポイント（ブロック差分結果を左右HTMLに変換）
- [x] リストブロックの再構築（連続する li ブロックを ul/ol で再ラップ）

### Phase 4: 統合
- [x] `src/diffEngine.ts` を更新: `computeDiff` を `computeBlockDiff` に委譲
- [x] デバッグログの削除
- [x] `src/components/DiffPanel.tsx` に diff ハイライト用 CSS クラスを追加

### Phase 5: 動作確認
- [ ] 同一リビジョン同士で差分なし表示を確認
- [ ] 片方のみにリスト構造がある場合、反対パネルにリストが表示されないこと
- [ ] ブロック内テキスト差分が自然な単位でハイライトされること
- [ ] スクロール同期が引き続き正常に動作すること
