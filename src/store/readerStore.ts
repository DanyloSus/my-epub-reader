import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Bookmark,
  EpubMetadata,
  Highlight,
  ReaderState,
  TocItem,
} from "../types";

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
  theme: "light" | "dark" | "sepia";
  fontFamily: string;
  lineHeight: number;
  marginSize: number;
  setFontSize: (size: number) => void;
  setTheme: (theme: "light" | "dark" | "sepia") => void;
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
  createBookmark: () => Bookmark | null;

  // Highlights
  highlights: Highlight[];
  addHighlight: (highlight: Highlight) => void;
  removeHighlight: (id: string) => void;
  updateHighlight: (id: string, updates: Partial<Highlight>) => void;

  // Actions
  goToLocation: (
    location:
      | string
      | { href: string; locations?: { progression?: number; cfi?: string } }
  ) => void;
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
      theme: "light",
      fontFamily: "Georgia",
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
          bookmarks: state.bookmarks.filter((bookmark) => bookmark.id !== id),
        })),

      createBookmark: () => {
        const { reader, currentLocation } = get();
        console.log(
          "Creating bookmark - reader:",
          !!reader,
          "currentLocation:",
          currentLocation
        );

        if (reader && currentLocation) {
          try {
            // Check if getCurrentLocator method exists
            if (
              reader.getCurrentLocator &&
              typeof reader.getCurrentLocator === "function"
            ) {
              const locator = reader.getCurrentLocator();
              console.log("Got locator:", locator);
              const bookmark: Bookmark = {
                id: Date.now().toString(),
                cfi: locator.locations?.cfi || "",
                href: locator.href || currentLocation,
                title:
                  locator.title ||
                  `Bookmark ${new Date().toLocaleDateString()}`,
                excerpt: locator.text || "",
                timestamp: new Date(),
              };
              get().addBookmark(bookmark);
              console.log("Bookmark created:", bookmark);
              return bookmark;
            } else {
              console.log(
                "getCurrentLocator not available, creating fallback bookmark"
              );
              // Fallback bookmark creation without locator
              const bookmark: Bookmark = {
                id: Date.now().toString(),
                cfi: "",
                href: currentLocation,
                title: `Bookmark ${new Date().toLocaleDateString()}`,
                excerpt: "",
                timestamp: new Date(),
              };
              get().addBookmark(bookmark);
              console.log("Fallback bookmark created:", bookmark);
              return bookmark;
            }
          } catch (error) {
            console.error("Error creating bookmark:", error);
            // Fallback bookmark creation
            const bookmark: Bookmark = {
              id: Date.now().toString(),
              cfi: "",
              href: currentLocation,
              title: `Bookmark ${new Date().toLocaleDateString()}`,
              excerpt: "",
              timestamp: new Date(),
            };
            get().addBookmark(bookmark);
            console.log("Error fallback bookmark created:", bookmark);
            return bookmark;
          }
        } else {
          console.error(
            "Cannot create bookmark - missing reader or currentLocation"
          );
          return null;
        }
      },

      // Highlights
      addHighlight: (highlight) =>
        set((state) => ({ highlights: [...state.highlights, highlight] })),

      removeHighlight: (id) =>
        set((state) => ({
          highlights: state.highlights.filter(
            (highlight) => highlight.id !== id
          ),
        })),

      updateHighlight: (id, updates) =>
        set((state) => ({
          highlights: state.highlights.map((highlight) =>
            highlight.id === id ? { ...highlight, ...updates } : highlight
          ),
        })),

      // Actions
      goToLocation: (location) => {
        const { reader } = get();
        if (reader && reader.goTo) {
          // If location is a string (href), convert to locator object
          if (typeof location === "string") {
            const locator = {
              href: location,
              locations: { progression: 0 },
            };
            console.log("Navigating to locator:", locator);
            reader.goTo(locator);
          } else {
            // If it's already an object, use it directly
            console.log("Navigating to location:", location);
            reader.goTo(location);
          }
          set({
            currentLocation:
              typeof location === "string" ? location : location.href,
          });
        } else if (reader && reader.navigateTo) {
          const href = typeof location === "string" ? location : location.href;
          console.log("Using navigateTo fallback:", href);
          reader.navigateTo(href);
          set({ currentLocation: href });
        } else {
          console.error("No navigation method available on reader");
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

      resetReader: () =>
        set({
          reader: null,
          isLoading: false,
          currentLocation: null,
          progress: 0,
          metadata: null,
          toc: [],
        }),
    }),
    {
      name: "epub-reader-storage",
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
