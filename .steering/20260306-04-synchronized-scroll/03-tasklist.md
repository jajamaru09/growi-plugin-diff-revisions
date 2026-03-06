# 03-tasklist.md

## タスクリスト

### 1. `syncScrollUtils.ts` の作成
- [x] `extractBlockElements()` - DOM からブロック要素（h1〜h6, p, table, ul, ol, blockquote, pre）と textContent を抽出する関数
- [x] `buildAnchorPairs()` - LCS ベースで左右のブロック要素をマッチングする関数（見出しは完全一致、その他は先頭20文字の前方一致）
- [x] `computeTargetScroll()` - マッチペアと線形補間を使ってスクロール先位置を算出する関数

### 2. `useSyncScroll.ts` の作成
- [x] カスタムフック本体の実装（leftRef, rightRef, enabled, leftHtml, rightHtml を受け取る）
- [x] HTML 変更時にアンカーペアを再構築する useEffect
- [x] scroll イベントリスナーの登録・解除
- [x] requestAnimationFrame ベースのスロットリング
- [x] isScrolling フラグによる相互トリガー防止

### 3. `DiffPanel.tsx` の変更
- [x] forwardRef でラップしてスクロールコンテナの ref を外部に公開

### 4. `DiffModal.tsx` の変更
- [x] `syncScroll` state の追加（デフォルト: true）
- [x] ヘッダーにトグルスイッチ UI を追加（Bootstrap form-switch）
- [x] 左右 DiffPanel の ref を保持
- [x] useSyncScroll フックの呼び出し

### 5. 動作確認
- [ ] 左スクロール → 右が連動することを確認
- [ ] 右スクロール → 左が連動することを確認
- [ ] トグル OFF → 独立スクロールになることを確認
- [ ] コンテンツ量が異なるリビジョンで見出し位置が揃うことを確認
- [ ] 相互トリガーによる無限ループが発生しないことを確認
- [ ] リビジョン切り替え時にアンカーペアが再構築されることを確認
