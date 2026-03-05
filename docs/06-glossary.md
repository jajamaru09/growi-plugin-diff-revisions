# ユビキタス言語定義

## 1. ドメイン用語

| 日本語 | 英語 | コード上の命名 | 定義 |
|---|---|---|---|
| リビジョン | Revision | `Revision` | ページの保存された特定時点のスナップショット |
| リビジョン番号 | Revision Number | `revisionNo` | リビジョンを古い順に1から採番した連番（APIデータには存在せず、プラグイン側で算出） |
| リビジョンID | Revision ID | `revisionId` / `_id` | MongoDBが付与するリビジョンの一意識別子 |
| 差分 | Diff | `diff` | 2つのリビジョン間の変更箇所 |
| ページ | Page | `page` | GROWIのWiki記事1件 |
| ページID | Page ID | `pageId` | ページの一意識別子（MongoDBのObjectId） |

## 2. UI用語

| 日本語 | 英語 | コード上の命名 | 定義 |
|---|---|---|---|
| 差分比較モーダル | Diff Modal | `DiffModal` | リビジョン差分を表示するモーダルダイアログ |
| 差分比較ボタン | Diff Button | `DiffButton` | サイドバーに配置されるモーダル起動ボタン |
| リビジョン選択 | Revision Selector | `RevisionSelector` | リビジョンを選ぶドロップダウンUI |
| 差分パネル | Diff Panel | `DiffPanel` | HTML差分を表示する左右の領域 |
| 左パネル | Left Panel | `leftRevision` | 比較元（古い方）のリビジョン表示領域 |
| 右パネル | Right Panel | `rightRevision` | 比較先（新しい方）のリビジョン表示領域 |

## 3. 技術用語

| 日本語 | 英語 | コード上の命名 | 定義 |
|---|---|---|---|
| レンダリング | Rendering | `render` | MarkdownをHTMLに変換して表示すること |
| ハイライト | Highlight | `highlight` | 差分箇所に背景色を付けて強調表示すること |
| 追加ハイライト | Added Highlight | `diff-added` | 追加された内容の淡い緑背景（#e6ffec） |
| 削除ハイライト | Removed Highlight | `diff-removed` | 削除された内容の淡いピンク背景（#ffebe9） |
| プラグイン活性化 | Activate | `activate` | GROWIがプラグインを読み込み開始するライフサイクルイベント |
| プラグイン非活性化 | Deactivate | `deactivate` | GROWIがプラグインを停止するライフサイクルイベント |
