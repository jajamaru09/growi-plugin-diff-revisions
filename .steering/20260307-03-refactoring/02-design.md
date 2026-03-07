# 02-design.md

## 変更設計

### 1. diffEngine.ts 削除

- `src/diffEngine.ts` を削除
- `src/components/DiffModal.tsx` のインポートを変更:
  - `import { computeDiff } from '../diffEngine.ts'` → `import { computeBlockDiff } from '../blockDiffEngine.ts'`
  - 呼び出し箇所: `computeDiff(lHtml, rHtml)` → `computeBlockDiff(lHtml, rHtml)`
- `blockDiffEngine.ts` の `DiffResult` 型をそのまま使用（重複解消）

### 2. htmldiff-js.d.ts 削除

- `src/htmldiff-js.d.ts` を削除

### 3. LCS 共通化

新規ファイル `src/lcs.ts` を作成:

```typescript
export function lcs<T>(
  left: T[],
  right: T[],
  isMatch: (a: T, b: T) => boolean,
): Array<[number, number]>
```

- DPテーブル構築 + バックトラックの汎用実装
- マッチしたインデックスペアの配列を返す

**変更対象:**
- `blockDiffEngine.ts` の `matchBlocks`: LCS 部分を `lcs()` に委譲
- `syncScrollUtils.ts` の `buildAnchorPairs`: LCS 部分を `lcs()` に委譲

### 4. useRevisionNavigation フック切り出し

新規ファイル `src/useRevisionNavigation.ts`:

```typescript
interface UseRevisionNavigationResult {
  leftId: string;
  rightId: string;
  setLeftId: (id: string) => void;
  setRightId: (id: string) => void;
  leftIdx: number;
  rightIdx: number;
  shiftRevision: (currentId: string, delta: number) => string;
  shiftBoth: (delta: number) => void;
  canLeftPrev: boolean;
  canLeftNext: boolean;
  canRightPrev: boolean;
  canRightNext: boolean;
  canBothPrev: boolean;
  canBothNext: boolean;
}

export function useRevisionNavigation(revisions: RevisionItem[]): UseRevisionNavigationResult
```

DiffModal.tsx から以下を移動:
- `leftId`, `rightId` state
- デフォルトリビジョン選択の useEffect
- `getIndex`, `shiftRevision`, `shiftBoth`
- `canLeftPrev` 等の算出値

### 5. htmldiff-js パッケージ削除

- `package.json` の dependencies から `htmldiff-js` を削除
- ユーザーに `npm install` の実行を依頼

## 影響範囲

| ファイル | 操作 |
|---|---|
| `src/diffEngine.ts` | 削除 |
| `src/htmldiff-js.d.ts` | 削除 |
| `src/lcs.ts` | 新規作成 |
| `src/useRevisionNavigation.ts` | 新規作成 |
| `src/blockDiffEngine.ts` | LCS を lcs.ts に委譲 |
| `src/syncScrollUtils.ts` | LCS を lcs.ts に委譲 |
| `src/components/DiffModal.tsx` | import変更、ナビゲーションロジック切り出し |
| `package.json` | htmldiff-js 削除 |
