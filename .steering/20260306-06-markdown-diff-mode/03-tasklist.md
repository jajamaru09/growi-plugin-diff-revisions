# 03-tasklist.md

## タスクリスト

### 1. `diff` パッケージの追加
- [x] `diff` と `@types/diff` をインストール

### 2. `markdownDiffEngine.ts` の作成
- [x] `SideBySideLine` 型定義（leftLineNo, leftText, rightLineNo, rightText, type）
- [x] `computeMarkdownDiff()` - diffArrays で行単位比較し、サイドバイサイドペアリストに変換
- [x] removed + added の連続チャンクを modified としてペアリング

### 3. `MarkdownDiffPanel.tsx` の作成
- [x] テーブルレイアウト（行番号列 + テキスト列 x 左右）
- [x] 行タイプ別の背景色（equal: 通常、removed: ピンク、added: 緑、modified: 左ピンク/右緑）
- [x] モノスペースフォント、white-space: pre-wrap でMarkdown原文表示
- [x] forwardRef でスクロールコンテナの ref を外部に公開

### 4. `DiffModal.tsx` の変更
- [x] `diffMode` state 追加（`'html' | 'markdown'`、デフォルト: `'html'`）
- [x] ヘッダーにモード切り替えボタングループ追加（Bootstrap btn-group）
- [x] diffMode に応じて HTML差分パネル / MarkdownDiffPanel を条件分岐表示
- [x] Markdown差分モード時はスクロール連動トグルを非表示
- [x] Markdown差分モード用の diff 計算（選択リビジョンの body を直接使用）

### 5. 動作確認
- [ ] HTML差分モードが既存通り動作することを確認
- [ ] Markdown差分モードで行番号付きサイドバイサイドdiffが表示されることを確認
- [ ] 削除行がピンク背景、追加行が緑背景で表示されることを確認
- [ ] モード切り替えが正しく動作することを確認
- [ ] リビジョン切り替え時にMarkdown差分が再計算されることを確認
