# 02-design.md

## 問題の本質

`htmldiff-js` は2つのHTMLを1つのマージdiff HTMLに統合する際、テキストレベルで差分を検出するが、HTML構造（ブロック要素のネスト）は一方のリビジョンの構造を維持する。そのため、片方にのみ存在するリスト構造内に反対側のテキストが `<ins>`/`<del>` として挿入され、タグ除去後もリスト構造が残る。

## 実装アプローチ

### DOM ベースの構造アーティファクト除去

regex ベースの処理では HTML 構造の解析に限界があるため、ブラウザの `DOMParser` を使用して DOM ツリーを操作する。

### アルゴリズム

`<ins>`/`<del>` タグ除去後の HTML に対して以下の処理を行う:

1. `DOMParser` で HTML をパースし DOM ツリーを取得
2. すべての `<ul>` / `<ol>` 要素を走査
3. 各リスト内の `<li>` 要素について、テキスト内容がすべてハイライトタグ（`<ins>` or `<del>`）内にあるかチェック
4. **リスト内の全 `<li>` がハイライトコンテンツのみ** → そのリスト構造は反対側リビジョンのもの → リスト構造を除去し、中のコンテンツを親要素に展開
5. **一部の `<li>` に通常テキストがある** → リスト構造は両リビジョンに共通 → そのまま維持

### 判定ロジック

```
isHighlightOnly(li, tag):
  li の子ノードを走査
  - テキストノード: 空白のみなら OK、それ以外は false
  - 要素ノード: tagName が tag (ins/del) なら OK、それ以外は false
  全ノードが OK なら true
```

- 左パネル（`<ins>` を除去済み、`<del>` を保持）: `highlightTag = 'del'`
- 右パネル（`<del>` を除去済み、`<ins>` を保持）: `highlightTag = 'ins'`

### ケース別の動作

| ケース | 左パネル | 右パネル |
|---|---|---|
| 左のみリスト、右はパラグラフ | リスト表示（`<del>` ハイライト付き） | リスト除去、テキストとして展開 |
| 右のみリスト、左はパラグラフ | リスト除去、テキストとして展開 | リスト表示（`<ins>` ハイライト付き） |
| 両方にリスト（項目変更あり） | リスト維持 | リスト維持 |
| 両方にリスト（項目追加/削除） | リスト維持（空 `<li>` は既存処理で除去） | リスト維持 |

### エッジケース: 両方にリストで全項目が異なる場合

左: `<ul><li>A</li><li>B</li></ul>` / 右: `<ul><li>X</li><li>Y</li></ul>`

この場合、右パネルで全 `<li>` が `<ins>` のみとなり、リストが展開される。実際には右にもリストが存在するが、全項目が完全に入れ替わるケースは稀であり、テキストとして展開されても差分の可読性には大きな影響がないため、許容する。

## 変更箇所

### `src/diffEngine.ts`

- `cleanStructuralArtifacts(html: string, highlightTag: 'ins' | 'del'): string` 関数を追加
  - DOMParser で HTML をパース
  - `<ul>`/`<ol>` 内の `<li>` を検査し、全 `<li>` がハイライトコンテンツのみの場合はリスト構造を除去
  - コンテンツを親要素に展開
- `computeDiff` 内で `removeEmptyBlocks` の後に `cleanStructuralArtifacts` を適用
  - 左パネル: `cleanStructuralArtifacts(left, 'del')`
  - 右パネル: `cleanStructuralArtifacts(right, 'ins')`

### 処理パイプライン（更新後）

```
htmldiff-js 出力
  → ins/del タグ除去（regex）
  → 空ブロック要素除去（regex, removeEmptyBlocks）
  → 構造アーティファクト除去（DOM, cleanStructuralArtifacts）
  → 最終 HTML
```

## 影響範囲

- `src/diffEngine.ts` のみ変更
- 他のコンポーネント（DiffPanel, DiffModal 等）への影響なし
- 既存のテキストレベル差分ハイライトは維持される

## 参考 URL

- [DOMParser - MDN](https://developer.mozilla.org/ja/docs/Web/API/DOMParser) - ブラウザ標準APIでHTMLをパースし、DOM操作が可能
