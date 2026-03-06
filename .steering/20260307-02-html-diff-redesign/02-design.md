# 02-design.md

## 設計方針

`htmldiff-js` のマージHTML方式を廃止し、**ブロック単位のマッチング → ブロック内テキスト差分**の2段階アプローチに切り替える。各パネルはオリジナルHTMLの構造を保持する。

## アーキテクチャ

```
左HTML → DOM解析 → ブロック抽出 ─┐
                                  ├→ ブロックマッチング(LCS) → ブロック内テキスト差分 → 左HTML(ハイライト付き)
右HTML → DOM解析 → ブロック抽出 ─┘                                                    → 右HTML(ハイライト付き)
```

## 処理フロー

### Step 1: ブロック要素の抽出

DOMParser で HTML をパースし、トップレベルのブロック要素を順序付きリストとして抽出する。

**抽出対象:**
- `h1` - `h6`（見出し）
- `p`（パラグラフ）
- `ul`, `ol`（リスト — 子 `<li>` を個別ブロックとして扱う）
- `blockquote`（引用）
- `pre`（コードブロック）
- `table`（テーブル — 1つのブロックとして扱う）
- `hr`（水平線）

各ブロックから以下を保持:
```typescript
interface Block {
  type: string;         // タグ名 ('p', 'li', 'h1', etc.)
  text: string;         // textContent（マッチング用）
  outerHTML: string;    // 元のHTML（表示用）
  element: Element;     // DOM参照（ハイライト挿入用）
}
```

**リストの扱い:** `<ul>` / `<ol>` はコンテナとして認識し、各 `<li>` を個別のブロックとして抽出する。これにより、リスト項目単位での追加・削除・変更が自然に表現できる。

### Step 2: ブロックマッチング（LCS）

左右のブロックリストに対して LCS（最長共通部分列）アルゴリズムを適用し、対応するブロックペアを特定する。

**マッチング基準:**
- 同じ `type`（タグ名）であること
- テキスト類似度が閾値以上であること

**テキスト類似度の計算:**
- 完全一致 → 1.0（変更なし）
- レーベンシュタイン距離ベースの類似度: `1 - (distance / max(len1, len2))`
- 閾値: **0.3 以上**で同一ブロックとみなす（大幅に変更されたパラグラフも対応付ける）
- 閾値以下 → 別ブロック（追加/削除として扱う）

**マッチング結果の分類:**
- **equal**: テキストが完全一致（ハイライトなし）
- **modified**: テキストが異なるが対応するブロック（ブロック内テキスト差分をハイライト）
- **removed**: 左のみに存在するブロック（左パネルでピンク背景）
- **added**: 右のみに存在するブロック（右パネルで緑背景）

### Step 3: ブロック内テキスト差分

`modified` ブロックペアに対して、テキストレベルの差分を検出しハイライトする。

**テキスト差分アルゴリズム:**
- `diff` パッケージの `diffChars` を使用
- ただし、最小マッチ長を設定: **3文字未満の一致は無視**（「の」1文字のような偶然一致を防止）
- 具体的実装: `diffChars` の結果をポストプロセスし、短い一致部分を隣接する変更に吸収する

**ハイライト挿入:**
- 左パネル: 削除部分を `<span class="diff-del">` でラップ
- 右パネル: 追加部分を `<span class="diff-ins">` でラップ
- ブロック要素のオリジナル HTML を DOMParser で再パースし、テキストノードを走査して差分位置にハイライトスパンを挿入

### Step 4: 最終HTML構築

マッチング結果に基づいて、各パネル用の最終HTMLを構築する。

**左パネル:**
- `equal` ブロック: オリジナルHTML そのまま
- `modified` ブロック: テキスト差分ハイライト付きHTML
- `removed` ブロック: オリジナルHTMLに `diff-block-del` クラスを付与（ピンク背景）
- `added` ブロック: 表示しない（右のみのブロック）

**右パネル:**
- `equal` ブロック: オリジナルHTML そのまま
- `modified` ブロック: テキスト差分ハイライト付きHTML
- `added` ブロック: オリジナルHTMLに `diff-block-ins` クラスを付与（緑背景）
- `removed` ブロック: 表示しない（左のみのブロック）

## データ構造

```typescript
interface Block {
  type: string;
  text: string;
  html: string;
  depth: number;        // ネスト深度（リスト内リスト対応）
  listTag?: 'ul' | 'ol'; // 親リストのタグ（li の場合）
}

type DiffType = 'equal' | 'modified' | 'removed' | 'added';

interface BlockDiff {
  type: DiffType;
  leftBlock: Block | null;
  rightBlock: Block | null;
  leftHighlightedHtml?: string;   // modified の場合のハイライト付きHTML
  rightHighlightedHtml?: string;
}
```

## 変更箇所

### 新規: `src/blockDiffEngine.ts`
- `extractBlocks(html: string): Block[]` — HTML からブロック要素を抽出
- `matchBlocks(leftBlocks: Block[], rightBlocks: Block[]): BlockDiff[]` — LCS ベースのブロックマッチング
- `highlightTextDiff(leftHtml: string, rightHtml: string): { left: string, right: string }` — ブロック内テキスト差分ハイライト
- `computeBlockDiff(leftHtml: string, rightHtml: string): DiffResult` — メインエントリポイント
- `mergeShortMatches(parts: Change[], minLength: number): Change[]` — 短い一致を隣接変更に吸収

### 変更: `src/diffEngine.ts`
- `computeDiff` の実装を `blockDiffEngine.ts` の `computeBlockDiff` に委譲
- 既存の `htmldiff-js` 依存、`removeEmptyBlocks`、`cleanStructuralArtifacts` は廃止

### 変更: `src/components/DiffPanel.tsx`
- diff ハイライト用の CSS クラス（`diff-del`, `diff-ins`, `diff-block-del`, `diff-block-ins`）のスタイルを追加

## CSS スタイル

```css
.diff-del {
  background-color: #ffebe9;
  text-decoration: line-through;
}
.diff-ins {
  background-color: #e6ffec;
}
.diff-block-del {
  background-color: #ffebe9;
}
.diff-block-ins {
  background-color: #e6ffec;
}
```

## 短い一致の吸収ロジック

`diffChars` の結果に対して、3文字未満の一致部分を前後の変更に吸収する:

```
入力: [removed:"マークダウン"], [equal:"の"], [removed:"形式"]
出力: [removed:"マークダウンの形式"]
```

これにより「の」1文字が一致として扱われ不自然な分割が起きる問題を解消する。

## 影響範囲

- `src/diffEngine.ts` — 実装の委譲先変更
- `src/blockDiffEngine.ts` — 新規ファイル
- `src/components/DiffPanel.tsx` — CSS追加
- `htmldiff-js` パッケージ — 不要になるが、即座に削除せず残しておく（将来の参考用）

## 参考 URL

- [diff パッケージ (npm)](https://www.npmjs.com/package/diff) — `diffChars`, `diffWords` 等のテキスト差分アルゴリズム。既にプロジェクトに導入済み
- [レーベンシュタイン距離](https://en.wikipedia.org/wiki/Levenshtein_distance) — テキスト類似度の計算に使用
