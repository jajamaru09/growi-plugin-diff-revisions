# 01-requirements.md

## 概要

差分比較モーダルのHTML表示で、Growiのcallout構文（`:::caution`, `:::warning` 等）がHTMLとしてレンダリングされない問題を修正する。

## 背景

現在の `markdownRenderer.ts` のunifiedパイプラインには、`:::` 構文（container directive）を処理するプラグインが含まれていない。そのため、`:::caution` のようなcalloutブロックがHTML変換時にそのまま無視されるか、プレーンテキストとして出力される。

Growi本体では以下の仕組みでcalloutを処理している：
1. `remark-directive` でMarkdownの `:::name` 構文を `containerDirective` ASTノードとしてパース
2. カスタムremarkプラグインで `containerDirective` ノードを `<callout type="..." label="...">` 要素に変換
3. `CalloutViewer` Reactコンポーネントで表示

本プラグインではReactコンポーネントは使用できないため、remarkプラグインの段階で直接HTMLの `<div>` 要素に変換し、CSSでスタイリングする。

## 対応するcalloutタイプ

Growi本体と同一のタイプをサポートする：
- `note`
- `tip`
- `important`
- `info`
- `warning`
- `danger`
- `caution`

## ユーザーストーリー

- ユーザーとして、差分比較モーダルでcalloutブロックを含むリビジョンを比較した際に、calloutがGrowiの閲覧画面と同様のスタイルで表示されることを期待する。

## 受け入れ条件

1. `:::warning`, `:::caution`, `:::tip`, `:::note`, `:::important`, `:::info`, `:::danger` の7種類のcalloutが正しくHTMLとしてレンダリングされる
2. callout内のMarkdown（太字、リンク、コード等）も正しくレンダリングされる
3. calloutのタイプごとに視覚的に区別できるスタイルが適用される
4. calloutにラベル（タイトル）が指定されている場合、そのラベルが表示される
5. 差分検出がcalloutブロックに対しても正しく動作する

## 制約事項

- Reactコンポーネントは使用不可（`dangerouslySetInnerHTML` でHTMLを挿入しているため）
- Growi本体のMaterial Symbolsアイコンフォントは利用できない可能性がある（代替手段を検討）
- `rehype-sanitize` がカスタム要素やクラスを除去しないよう設定が必要
