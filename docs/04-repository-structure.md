# リポジトリ構造定義書

## 1. フォルダ・ファイル構成

```
growi-plugin-diff-revisions/
├── client-entry.tsx                # プラグインエントリポイント（activate/deactivate）
├── package.json                    # プロジェクト設定・依存関係
├── tsconfig.json                   # TypeScript設定（ブラウザ向け）
├── tsconfig.node.json              # TypeScript設定（Node/Vite設定向け）
├── vite.config.ts                  # Viteビルド設定
├── .gitignore
├── LICENSE                         # MITライセンス
├── README.md
├── CLAUDE.md                       # Claude開発プロセス定義
├── docs/                           # 永続的ドキュメント
│   ├── 01-product-requirements.md
│   ├── 02-functional-design.md
│   ├── 03-architecture.md
│   ├── 04-repository-structure.md
│   ├── 05-development-guidelines.md
│   └── 06-glossary.md
├── .steering/                      # 作業単位ドキュメント
├── dist/                           # ビルド出力（git管理対象）
└── src/
    ├── sidebarMount.tsx            # サイドバーへのボタンマウント管理
    ├── growiNavigation.ts          # Navigation APIによるページ遷移検知
    ├── pageContext.ts              # ページID・モード抽出ユーティリティ
    ├── growiApi.ts                 # GROWI REST API呼び出し
    ├── markdownRenderer.ts         # Markdown→HTMLレンダリング（unified/remark/rehype）
    ├── diffEngine.ts               # HTML差分検出・ハイライト生成
    ├── types.ts                    # 共通型定義
    └── components/
        ├── DiffButton.tsx          # サイドバー差分比較ボタン
        ├── DiffModal.tsx           # 差分比較モーダル（全体レイアウト）
        ├── RevisionSelector.tsx    # リビジョン選択ドロップダウン
        └── DiffPanel.tsx           # 差分HTML表示パネル
```

## 2. ディレクトリの役割

| ディレクトリ | 役割 |
|---|---|
| `/` (ルート) | エントリポイント、ビルド設定、プロジェクト設定 |
| `src/` | ソースコード本体 |
| `src/components/` | Reactコンポーネント |
| `dist/` | Viteビルド出力。GROWIがプラグインとして読み込むファイル |
| `docs/` | 永続的設計ドキュメント |
| `.steering/` | 作業単位のステアリングドキュメント |

## 3. ファイル配置ルール

- **エントリポイント**: `client-entry.tsx` はルート直下に配置（GROWIプラグイン規約）
- **ソースコード**: すべて `src/` 配下
- **Reactコンポーネント**: `src/components/` 配下にPascalCaseファイル名
- **ユーティリティ/サービス**: `src/` 直下にcamelCaseファイル名
- **型定義**: 共通型は `src/types.ts`、コンポーネント固有の型はコンポーネントファイル内
- **ビルド成果物**: `dist/` に出力、GROWIプラグインとして配布するためgit管理対象

## 変更履歴

| ステアリング | 変更内容 |
|---|---|
| [#04-synchronized-scroll](.steering/20260306-04-synchronized-scroll/) | ファイル構成に影響: syncScrollUtils.ts、useSyncScroll.tsを追加 |
| [#06-markdown-diff-mode](.steering/20260306-06-markdown-diff-mode/) | ファイル構成に影響: markdownDiffEngine.ts、MarkdownDiffPanel.tsxを追加 |
| [#02-html-diff-redesign](.steering/20260307-02-html-diff-redesign/) | ファイル構成に影響: blockDiffEngine.tsを追加、diffEngine.tsの役割を委譲に変更 |
| [#03-refactoring](.steering/20260307-03-refactoring/) | ファイル構成に影響: lcs.ts・useRevisionNavigation.tsを追加、diffEngine.ts・htmldiff-js.d.tsを削除 |
