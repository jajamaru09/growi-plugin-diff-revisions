import type { Revision, RevisionItem } from './types.ts';

const LIMIT = 100;

interface PageResponse {
  page: { _id: string };
}

export async function fetchPageIdByPath(path: string): Promise<string> {
  const res = await fetch(`/_api/v3/page/?path=${encodeURIComponent(path)}`);
  if (!res.ok) {
    throw new Error(`ページ情報の取得に失敗しました: ${res.status}`);
  }
  const data: PageResponse = await res.json();
  return data.page._id;
}

interface RevisionListResponse {
  revisions: Revision[];
  totalCount: number;
  offset: number;
}

export async function fetchAllRevisions(pageId: string): Promise<RevisionItem[]> {
  const allRevisions: Revision[] = [];
  let offset = 0;

  // Loop to fetch all revisions (limit max 100 per request)
  while (true) {
    const res = await fetch(
      `/_api/v3/revisions/list?pageId=${pageId}&offset=${offset}&limit=${LIMIT}`,
    );
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    const data: RevisionListResponse = await res.json();
    allRevisions.push(...data.revisions);

    if (allRevisions.length >= data.totalCount) break;
    offset += LIMIT;
  }

  // Sort by createdAt ascending (oldest first) and assign revisionNo
  allRevisions.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return allRevisions.map((rev, index) => ({
    revisionNo: index + 1,
    revisionId: rev._id,
    createdAt: new Date(rev.createdAt),
    body: rev.body,
    authorName: rev.author.name || rev.author.username || 'Unknown',
  }));
}
