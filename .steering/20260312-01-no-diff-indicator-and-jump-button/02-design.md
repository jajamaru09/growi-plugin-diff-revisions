# 02-design.md

## 実装アプローチ

### 機能1: 差分なし表示

**判定ロジック:**
- `DiffModal.tsx` 内で左右の選択リビジョンの `body` を比較する
- `body` が完全一致（`===`）の場合を「差分なし」と判定
- `useMemo` で `noDiff` フラグを導出する

**表示:**
- ヘッダーの「差分比較」タイトルとモード切替ボタン群の間（中央領域）に配置
- Bootstrap の `badge bg-info` を使用し、やや目立つスタイルで「差分なし」と表示
- `noDiff` が `true` の場合のみ表示（条件レンダリング）

**ヘッダーレイアウト変更:**
- 現在: `<h5>差分比較</h5>` | `<右側コントロール群>`（justify-content: space-between）
- 変更後: `<h5>差分比較</h5>` | `<中央バッジ>` | `<右側コントロール群>` の3分割構成にはせず、現在のflex space-betweenレイアウトのまま、右側コントロール群の先頭にバッジを挿入する形とする（中央寄りに見える位置）

### 機能2: 最初の差分へジャンプボタン

**ボタン配置:**
- リビジョンセレクター行とDiffコンテンツ領域の間に、中央揃えの行を追加
- HTMLモード時のみ表示
- `▼ 最初の差分へ` のようなラベル付き小ボタン

**スクロール処理:**
- 左右のDiffPanelのDOM内から差分要素（`.diff-del`, `.diff-ins`, `.diff-block-del`, `.diff-block-ins`）を検索
- 最初に見つかった差分要素に `scrollIntoView({ behavior: 'smooth', block: 'start' })` を実行
- 左右両パネルそれぞれで最初の差分要素にスクロール（syncScroll有効時は片方のスクロールに連動する）
- `noDiff` が `true` の場合はボタンを `disabled` にする

## 変更するコンポーネント

| ファイル | 変更内容 |
|---|---|
| `src/components/DiffModal.tsx` | noDiffフラグ導出、ヘッダーにバッジ追加、ジャンプボタン行追加 |

## データ構造の変更

なし（既存のデータ構造で対応可能）

## 影響範囲の分析

- `DiffModal.tsx` のみの変更で完結する
- 既存のDiffPanel、MarkdownDiffPanel、RevisionSelectorへの変更は不要
- syncScrollとの干渉: ジャンプボタンによるスクロールはsyncScroll有効時に連動するため、左パネルのみ `scrollIntoView` を呼べば右パネルも追従する

## 参考URL

なし（既存実装の拡張のため）
