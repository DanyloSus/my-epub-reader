import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ReaderState, ReaderSettings, EpubMetadata, Bookmark, Highlight, TocItem } from '../types';

interface ReaderStore extends ReaderState {
  // Reader instance
  reader: any; // D2Reader instance
  setReader: (reader: any) => void;
  
  // Loading state
  setLoading: (loading: boolean) => void;
  
  // Navigation
  currentLocation: string | null;
  setCurrentLocation: (location: string) => void;
  
  // Progress
  progress: number;
  setProgress: (progress: number) => void;
  
  // UI state
  isSettingsOpen: boolean;
  isTocOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  setTocOpen: (open: boolean) => void;
  
  // Reader settings
  fontSize: number;
  theme: 'light' | 'dark' | 'sepia';
  fontFamily: string;
  lineHeight: number;
  marginSize: number;
  setFontSize: (size: number) => void;
  setTheme: (theme: 'light' | 'dark' | 'sepia') => void;
  setFontFamily: (family: string) => void;
  setLineHeight: (height: number) => void;
  setMarginSize: (size: number) => void;
  
  // Book metadata
  metadata: EpubMetadata | null;
  setMetadata: (metadata: EpubMetadata) => void;
  
  // Table of contents
  toc: TocItem[];
  setToc: (toc: TocItem[]) => void;
  
  // Bookmarks
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (id: string) => void;
  
  // Highlights
  highlights: Highlight[];
  addHighlight: (highlight: Highlight) => void;
  removeHighlight: (id: string) => void;
  updateHighlight: (id: string, updates: Partial<Highlight>) => void;
  
  // Actions
  goToLocation: (location: string) => void;
  nextPage: () => void;
  previousPage: () => void;
  resetReader: () => void;
}

export const useReaderStore = create<ReaderStore>()(
  persist(
    (set, get) => ({
      // Initial state
      reader: null,
      isLoading: false,
      currentLocation: null,
      progress: 0,
      isSettingsOpen: false,
      isTocOpen: false,
      fontSize: 16,
      theme: 'light',
      fontFamily: 'Georgia',
      lineHeight: 1.4,
      marginSize: 2,
      metadata: null,
      toc: [],
      bookmarks: [],
      highlights: [],
      
      // Reader management
      setReader: (reader) => set({ reader }),
      
      // Loading state
      setLoading: (isLoading) => set({ isLoading }),
      
      // Navigation
      setCurrentLocation: (currentLocation) => set({ currentLocation }),
      
      // Progress
      setProgress: (progress) => set({ progress }),
      
      // UI state
      setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
      setTocOpen: (isTocOpen) => set({ isTocOpen }),
      
      // Reader settings
      setFontSize: (fontSize) => {
        set({ fontSize });
        const { reader } = get();
        if (reader) {
          reader.applyUserSettings({ fontSize });
        }
      },
      
      setTheme: (theme) => {
        set({ theme });
        const { reader } = get();
        if (reader) {
          reader.applyUserSettings({ theme });
        }
      },
      
      setFontFamily: (fontFamily) => {
        set({ fontFamily });
        const { reader } = get();
        if (reader) {
          reader.applyUserSettings({ fontFamily });
        }
      },
      
      setLineHeight: (lineHeight) => {
        set({ lineHeight });
        const { reader } = get();
        if (reader) {
          reader.applyUserSettings({ lineHeight });
        }
      },
      
      setMarginSize: (marginSize) => {
        set({ marginSize });
        const { reader } = get();
        if (reader) {
          reader.applyUserSettings({ marginSize });
        }
      },
      
      // Book metadata
      setMetadata: (metadata) => set({ metadata }),
      
      // Table of contents
      setToc: (toc) => set({ toc }),
      
      // Bookmarks
      addBookmark: (bookmark) => 
        set((state) => ({ bookmarks: [...state.bookmarks, bookmark] })),
      
      removeBookmark: (id) =>
        set((state) => ({ 
          bookmarks: state.bookmarks.filter(bookmark => bookmark.id !== id) 
        })),
      
      // Highlights
      addHighlight: (highlight) =>
        set((state) => ({ highlights: [...state.highlights, highlight] })),
      
      removeHighlight: (id) =>
        set((state) => ({ 
          highlights: state.highlights.filter(highlight => highlight.id !== id) 
        })),
      
      updateHighlight: (id, updates) =>
        set((state) => ({
          highlights: state.highlights.map(highlight =>
            highlight.id === id ? { ...highlight, ...updates } : highlight
          )
        })),
      
      // Actions
      goToLocation: (location) => {
        const { reader } = get();
        if (reader && reader.goTo) {
          reader.goTo(location);
          set({ currentLocation: location });
        } else if (reader && reader.navigateTo) {
          reader.navigateTo(location);
          set({ currentLocation: location });
        }
      },
      
      nextPage: () => {
        const { reader } = get();
        if (reader && reader.nextPage) {
          reader.nextPage();
        } else if (reader && reader.next) {
          reader.next();
        }
      },
      
      previousPage: () => {
        const { reader } = get();
        if (reader && reader.previousPage) {
          reader.previousPage();
        } else if (reader && reader.previous) {
          reader.previous();
        }
      },
      
      resetReader: () => set({
        reader: null,
        isLoading: false,
        currentLocation: null,
        progress: 0,
        metadata: null,
        toc: [],
      }),
    }),
    {
      name: 'epub-reader-storage',
      partialize: (state) => ({
        fontSize: state.fontSize,
        theme: state.theme,
        fontFamily: state.fontFamily,
        lineHeight: state.lineHeight,
        marginSize: state.marginSize,
        bookmarks: state.bookmarks,
        highlights: state.highlights,
      }),
    }
  )
);
