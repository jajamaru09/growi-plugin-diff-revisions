# 02-design.md

## 実装アプローチ

### Markdown行単位diff

`diff` パッケージの `diffArrays` を使用し、Markdownテキストを行単位で比較する。結果をサイドバイサイドの行ペアリストに変換し、テーブル形式で表示する。

### diffアルゴリズム

```
左Markdown.split('\n')  →  左行配列
右Markdown.split('\n')  →  右行配列
         ↓
diffArrays(左行配列, 右行配列)
         ↓
DiffLine[] (各行の状態: equal / removed / added)
         ↓
サイドバイサイドペアリング
         ↓
SideBySideLine[] (左行番号, 左テキスト, 右行番号, 右テキスト, タイプ)
```

### サイドバイサイドペアリングのロジック

diffArraysの結果（equal / added / removed チャンク）をサイドバイサイドの行ペアに変換する:

- **equal**: 左右に同じ行を表示（両方に行番号あり）
- **removed → added が連続**: 変更行として左右に並べる（修正された行）
- **removed のみ**: 左に行を表示、右は空行
- **added のみ**: 左は空行、右に行を表示

```
例:
diff結果: [equal "# はじめに"], [removed "旧テキスト"], [added "新テキスト"], [equal "共通行"]

サイドバイサイド:
  行1 | # はじめに    | 行1 | # はじめに     | equal
  行2 | 旧テキスト    | 行2 | 新テキスト     | modified
  行3 | 共通行        | 行3 | 共通行         | equal
```

## 変更するコンポーネント

### 1. `markdownDiffEngine.ts` - 新規作成

Markdownテキストの行単位diff計算を担当する:

```typescript
interface SideBySideLine {
  leftLineNo: number | null;
  leftText: string;
  rightLineNo: number | null;
  rightText: string;
  type: 'equal' | 'removed' | 'added' | 'modified';
}

function computeMarkdownDiff(leftBody: string, rightBody: string): SideBySideLine[]
```

- `diff` パッケージの `diffArrays` を使用
- removed + added の連続チャンクを modified としてペアリング

### 2. `MarkdownDiffPanel.tsx` - 新規作成

Markdown差分のサイドバイサイド表示コンポーネント:

- テーブルレイアウト（`<table>`）で行番号とテキストを表示
- 左パネル列: 行番号 | テキスト
- 右パネル列: 行番号 | テキスト
- 行タイプに応じた背景色:
  - `equal`: 通常背景
  - `removed`: 淡いピンク（`#ffebe9`）/ 行番号セル: やや濃いピンク（`#ffd7d5`）
  - `added`: 淡い緑（`#e6ffec`）/ 行番号セル: やや濃い緑（`#ccffd8`）
  - `modified`: 左が淡いピンク、右が淡い緑
- テキストはモノスペースフォントで表示
- forwardRef でスクロールコンテナのrefを外部に公開（スクロール連動対応）

### 3. `DiffModal.tsx` - 変更

- `diffMode` state を追加（`'html' | 'markdown'`、デフォルト: `'html'`）
- ヘッダーにモード切り替えボタンを追加（ボタングループまたはタブ）
- `diffMode === 'html'` の場合: 既存の左右DiffPanelを表示
- `diffMode === 'markdown'` の場合: MarkdownDiffPanelを表示
- スクロール連動: HTML差分モードは既存のuseSyncScroll、Markdown差分モードはテーブルが単一スクロールコンテナのため不要（左右が同一テーブル内で自然に同期）

### 4. `diff` パッケージの追加

- `npm install diff` / `npm install -D @types/diff`

## データ構造の変更

なし（既存のRevisionItemのbodyフィールドをそのまま使用）

## 影響範囲の分析

- `DiffModal.tsx`: モード切り替えUI追加、条件分岐でパネル表示を切り替え
- 新規ファイル2つ（`markdownDiffEngine.ts`, `MarkdownDiffPanel.tsx`）
- 既存のDiffPanel, diffEngine, useSyncScrollへの変更なし

## モード切り替えUIの配置

ヘッダーの「差分比較」タイトルとスクロール連動トグルの間に、ボタングループを配置する:

```
┌──────────────────────────────────────────────────────────────┐
│  差分比較   [HTML | Markdown]   [スクロール連動] ☑      [×]  │
├──────────────────────────────────────────────────────────────┤
```

Bootstrap の `btn-group` + `btn-outline-primary` / `btn-primary` でアクティブ状態を表現する。

## Markdown差分モードのレイアウト

Growiの標準diff画面に合わせ、単一テーブルとして表示する:

```
┌────────────────────────────────────────────────────────┐
│ LN │ 左テキスト              │ LN │ 右テキスト         │
├────┼────────────────────────┼────┼───────────────────┤
│  1 │ # はじめに             │  1 │ # はじめに          │  (equal)
│  2 │ 旧テキスト             │  2 │ 新テキスト          │  (modified)
│    │                        │  3 │ 追加された行        │  (added)
│  3 │ 共通行                 │  4 │ 共通行              │  (equal)
└────┴────────────────────────┴────┴───────────────────┘
```

- テーブルは50%:50%で左右に分割（各側に行番号列+テキスト列）
- 行番号列は狭い固定幅
- テキスト列は `white-space: pre-wrap` でMarkdown原文を表示
- スクロール連動トグルはMarkdownモード時は非表示（単一テーブルのため不要）

## 参考 URL

- Growiの標準リビジョン比較画面（ユーザー提供スクリーンショット）
  - サイドバイサイドの行単位diff
  - 行番号付き、削除行は赤背景、追加行は緑背景
