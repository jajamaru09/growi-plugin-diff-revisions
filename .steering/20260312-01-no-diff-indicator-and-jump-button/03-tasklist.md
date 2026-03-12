# 03-tasklist.md

## タスクリスト

### タスク1: 差分なしフラグの導出
- [x] `DiffModal.tsx` に `useMemo` で `noDiff` フラグを追加
- 左右の選択リビジョンの `body` を取得し `===` で比較
- 両方が選択されている場合のみ判定（未選択時は `false`）

### タスク2: ヘッダーに「差分なし」バッジを表示
- [x] ヘッダーの右側コントロール群の先頭に `badge bg-info` バッジを条件レンダリング
- `noDiff === true` の場合のみ表示
- テキスト: 「差分なし」

### タスク3: 最初の差分へジャンプボタンの追加
- [x] リビジョンセレクター行とDiffコンテンツ領域の間に中央揃えのボタン行を追加
- HTMLモード時のみ表示（`diffMode === 'html'`）
- ボタンラベル: `▼ 最初の差分へ`
- `noDiff` が `true` の場合は `disabled`
- [x] クリックハンドラで左パネルDOM内の最初の差分要素（`.diff-del, .diff-ins, .diff-block-del, .diff-block-ins`）に `scrollIntoView({ behavior: 'smooth', block: 'start' })` を実行

### タスク4: 動作確認
- [ ] ビルドが通ることを確認
