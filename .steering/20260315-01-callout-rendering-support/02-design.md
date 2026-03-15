# 02-design.md

## 実装アプローチ

### 1. `remark-directive` パッケージの追加

Markdownの `:::name` 構文を `containerDirective` ASTノードとしてパースするため、`remark-directive` をdependenciesに追加する。

### 2. カスタムremarkプラグインの作成（`remarkCallout.ts`）

`remark-directive` がパースした `containerDirective` ノードを走査し、calloutタイプに一致するものを `<div>` 構造のHTMLに変換するremarkプラグインを新規作成する。

**変換ロジック:**
- `containerDirective` ノードの `name` が `AllCallout`（`note`, `tip`, `important`, `info`, `warning`, `danger`, `caution`）に含まれるか判定
- 一致する場合、`data.hName = 'div'`、`data.hProperties = { className: 'callout callout-{type}' }` を設定
- ラベル（directiveLabel）がある場合、indicator部分のHTML子ノードを挿入
- ラベルがない場合、タイプ名をデフォルトのタイトルとして表示

**出力HTML構造:**
```html
<div class="callout callout-warning">
  <div class="callout-indicator">
    <div class="callout-title">Warning</div>
  </div>
  <div class="callout-content">
    <p>callout内のコンテンツ</p>
  </div>
</div>
```

※ Material Symbolsアイコンはプラグイン環境で利用できない可能性が高いため、アイコンは省略する。タイトルテキストのみでタイプを識別する。

### 3. `markdownRenderer.ts` のパイプライン更新

`remarkParse` → `remarkGfm` の後、`remarkRehype` の前に以下を追加：
1. `remarkDirective`（`:::` 構文パーサー）
2. `remarkCallout`（カスタムプラグイン）

`remarkRehype` に `allowDangerousHtml: true` を追加（calloutのHTML構造を通すため）。

`rehypeSanitize` のスキーマを拡張し、callout関連のクラス名と要素を許可する。

### 4. `DiffPanel.tsx` にcalloutスタイルを追加

Growi本体の `CalloutViewer.module.scss` を参考に、CSSを `DIFF_STYLES` に追加する。

**カラーマッピング（Bootstrap CSS変数にフォールバック値を設定）:**
| タイプ | 色 | フォールバック |
|---|---|---|
| note / info | `var(--bs-info, #0dcaf0)` | 水色 |
| tip | `var(--bs-success, #198754)` | 緑 |
| important | `var(--bs-primary, #0d6efd)` | 青 |
| warning | `var(--bs-warning, #ffc107)` | 黄 |
| danger / caution | `var(--bs-danger, #dc3545)` | 赤 |

### 5. `blockDiffEngine.ts` のブロック認識更新

`extractBlocks` の `BLOCK_TAGS` に `div` は含まれていないが、`walk` 関数が非ブロック要素（div等）の場合は再帰する設計になっている。calloutの `<div class="callout ...">` はブロックとして認識させたいため、calloutクラスを持つ `div` を `BLOCK_TAGS` の判定に含める対応を行う。

## 変更するコンポーネント

| ファイル | 変更内容 |
|---|---|
| `package.json` | `remark-directive` を dependencies に追加 |
| `src/remarkCallout.ts` | **新規作成** - カスタムremarkプラグイン |
| `src/markdownRenderer.ts` | パイプラインに `remarkDirective` と `remarkCallout` を追加、sanitize設定の拡張 |
| `src/components/DiffPanel.tsx` | callout用CSSスタイルを追加 |
| `src/blockDiffEngine.ts` | callout divをブロック要素として認識するよう更新 |

## 影響範囲の分析

- **HTML差分表示**: calloutブロックが正しくレンダリング・差分検出される
- **Markdown差分表示**: 変更なし（rawテキスト表示のため影響なし）
- **既存機能**: callout構文を含まないMarkdownには影響なし

## 参考 URL

- https://github.com/weseek/growi/tree/master/apps/app/src/features/callout
  - Growi本体のcallout実装。remarkプラグインで `containerDirective` → `<callout>` 変換、CalloutViewerコンポーネントでレンダリング
  - 対応タイプ: `note`, `tip`, `important`, `info`, `warning`, `danger`, `caution`
  - CSS: Bootstrap CSS変数ベースの左ボーダー + インジケーター構造
- https://github.com/remarkjs/remark-directive
  - `:::name` 構文を `containerDirective` ASTノードにパースするremarkプラグイン
  - ハンドラーは自前で実装する必要がある（`data.hName`, `data.hProperties` を設定）
- https://github.com/weseek/growi/blob/master/apps/app/src/client/services/renderer/renderer.tsx
  - Growiのレンダリングパイプライン構成。`remarkDirective` + `growiDirective` + callout remarkPlugin の組み合わせ
