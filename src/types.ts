export interface RevisionAuthor {
  _id: string;
  name: string;
  username: string;
}

export interface Revision {
  _id: string;
  format: string;
  pageId: string;
  body: string;
  author: RevisionAuthor;
  origin?: string;
  hasDiffToPrev: boolean;
  createdAt: string;
}

export interface RevisionItem {
  revisionNo: number;
  revisionId: string;
  createdAt: Date;
  body: string;
  authorName: string;
}

export type PageMode = 'view' | 'edit';

export interface GrowiPageContext {
  pageId: string;
  mode: PageMode;
  revisionId?: string;
}
