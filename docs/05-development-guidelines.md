# 開発ガイドライン

## 1. コーディング規約

### 1.1 言語

- TypeScript strict モードを使用
- `any` 型の使用は原則禁止（外部ライブラリの型定義が不足する場合のみ許可）

### 1.2 モジュール

- ESModules（`import` / `export`）を使用
- デフォルトエクスポートは避け、名前付きエクスポートを優先

### 1.3 関数

- 関数コンポーネントとhooksを使用（クラスコンポーネント不使用）
- コールバックは `useCallback` でメモ化

## 2. 命名規則

| 対象 | 規則 | 例 |
|---|---|---|
| ファイル（コンポーネント） | PascalCase.tsx | `DiffModal.tsx` |
| ファイル（ユーティリティ） | camelCase.ts | `growiApi.ts` |
| コンポーネント | PascalCase | `DiffPanel` |
| 関数 | camelCase | `fetchRevisions` |
| 変数 | camelCase | `revisionList` |
| 定数 | UPPER_SNAKE_CASE | `PLUGIN_NAME` |
| 型/インターフェース | PascalCase | `RevisionItem` |
| CSSクラス | kebab-case | `diff-added` |

## 3. スタイリング規約

- モーダルUIはBootstrap互換のクラスを使用（GROWIがBootstrapを採用しているため）
- HTML表示領域には `wiki` クラスを付与してGROWIのCSSを継承
- プラグイン固有のスタイルはインラインスタイルまたはCSS-in-JSで記述
- 差分ハイライトの色: 追加 `#e6ffec`、削除 `#ffebe9`

## 4. テスト規約

- 本プラグインはGROWI環境上でのみ動作するため、ユニットテストは必要に応じて追加
- 動作確認はGROWI開発環境での手動テストを基本とする

## 5. Git規約

### 5.1 コミットメッセージ

```
<type>: <summary>

<body（任意）>
```

**type:**
- `feat`: 新機能
- `fix`: バグ修正
- `refactor`: リファクタリング
- `docs`: ドキュメント
- `chore`: ビルド設定等

### 5.2 ブランチ

- `main`: メインブランチ
- `feat/<feature-name>`: 機能開発ブランチ
- `fix/<bug-name>`: バグ修正ブランチ
