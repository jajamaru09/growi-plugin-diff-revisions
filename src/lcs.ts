/**
 * Generic LCS (Longest Common Subsequence) implementation.
 * Returns an array of matched index pairs [leftIndex, rightIndex].
 */
export function lcs<T>(
  left: T[],
  right: T[],
  isMatch: (a: T, b: T) => boolean,
): Array<[number, number]> {
  const m = left.length;
  const n = right.length;
  if (m === 0 || n === 0) return [];

  // Build DP table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (isMatch(left[i - 1], right[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find matched pairs
  const pairs: Array<[number, number]> = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (isMatch(left[i - 1], right[j - 1])) {
      pairs.push([i - 1, j - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  pairs.reverse();
  return pairs;
}
