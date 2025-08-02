export interface ReaderState {
  isLoading: boolean;
  currentLocation: string | null;
  progress: number;
  isSettingsOpen: boolean;
  isTocOpen: boolean;
  fontSize: number;
  theme: 'light' | 'dark' | 'sepia';
  fontFamily: string;
  lineHeight: number;
  marginSize: number;
}

export interface EpubMetadata {
  title: string;
  author: string;
  identifier: string;
  language: string;
  description?: string;
  publisher?: string;
  publishedDate?: string;
  coverImage?: string;
}

export interface TocItem {
  id: string;
  href: string;
  title: string;
  level: number;
  children?: TocItem[];
}

export interface ReadingPosition {
  href: string;
  cfi: string;
  percentage: number;
}

export interface ReaderSettings {
  fontSize: number;
  fontFamily: string;
  theme: 'light' | 'dark' | 'sepia';
  lineHeight: number;
  marginSize: number;
  autoBookmark: boolean;
}

export interface Bookmark {
  id: string;
  cfi: string;
  href: string;
  title: string;
  excerpt: string;
  timestamp: Date;
}

export interface Highlight {
  id: string;
  cfi: string;
  href: string;
  text: string;
  color: string;
  note?: string;
  timestamp: Date;
}
