import React, { useEffect, useRef } from "react";
import { useReaderStore } from "store";
import { Box, CircularProgress, Typography } from "ui";
import "./ReaderViewport.css";

interface ReaderViewportProps {
  epubUrl?: string;
}

export const ReaderViewport: React.FC<ReaderViewportProps> = ({
  epubUrl = "http://localhost:3003/epub/games.epub",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    reader,
    setReader,
    isLoading,
    setLoading,
    setMetadata,
    setToc,
    setProgress,
    setCurrentLocation,
    fontSize,
    fontFamily,
    theme,
    lineHeight,
    marginSize,
  } = useReaderStore();

  const initializeWithReader = async (D2Reader: any) => {
    console.log("Loading EPUB from:", epubUrl);

    try {
      // Ensure the required container exists in the document with proper structure
      let container = document.getElementById("D2Reader-Container");
      if (!container) {
        // Create the proper DOM structure that r2d2bc expects in the document body
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div id="D2Reader-Container">
              <main style="height: 100%; width: 100%;" tabindex="-1" id="iframe-wrapper">
                <div id="reader-loading" class="loading">
                  <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; gap: 16px;">
                    <div class="loading-spinner"></div>
                    <span>Loading EPUB...</span>
                  </div>
                </div>
                <div id="reader-error" class="error" style="display: none;">
                  <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; gap: 16px;">
                    <span>Error loading EPUB</span>
                  </div>
                </div>
              </main>
            </div>
          `;
        }
        // Verify the container was created
        container = document.getElementById("D2Reader-Container");
        if (!container) {
          throw new Error("Failed to create D2Reader-Container element");
        }
        console.log("Created D2Reader-Container:", container);
      } else {
        console.log("D2Reader-Container already exists:", container);
      }

      // Create URL object for the manifest file
      let url: URL;
      try {
        // Try to create URL directly (for full URLs)
        url = new URL(epubUrl);
        console.log("URL created successfully:", url.toString());
      } catch (error) {
        // If that fails, assume it's a relative path and create full URL
        url = new URL(epubUrl, window.location.origin);
        console.log("URL created with origin:", url.toString());
      }

      // Test the URL accessibility first
      console.log("Testing URL accessibility...");
      try {
        const response = await fetch(url.toString(), { method: "HEAD" });
        console.log("URL test response:", response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (fetchError) {
        console.error("URL accessibility test failed:", fetchError);
        throw new Error(
          `Cannot access EPUB URL: ${fetchError instanceof Error ? fetchError.message : "Unknown error"}`
        );
      }

      // Initialize the reader with the manifest file and enable positions
      console.log("Initializing D2Reader with URL:", url.toString());
      const readerInstance = await D2Reader.load({
        url: url,
        injectables: [
          {
            type: "style",
            url: "/readium-css/ReadiumCSS-before.css",
            r2before: true,
          },
          {
            type: "style", 
            url: "/readium-css/ReadiumCSS-default.css",
            r2default: true,
          },
          {
            type: "style",
            url: "/readium-css/ReadiumCSS-after.css", 
            r2after: true,
          },
        ],
        injectablesFixed: [],
        // Enable scrolling and proper content handling
        settings: {
          verticalScroll: true,
          enableGPUHardwareAcceleration: true,
        },
        // Enable position generation for book-wide progress calculation
        rights: {
          autoGeneratePositions: true,
        },
      });

      console.log("Reader instance created:", readerInstance);

      // Configure reader for optimal scrolling
      if (readerInstance.scroll) {
        readerInstance.scroll(true); // Enable vertical scrolling
      }

      // Ensure content can be scrolled
      if (readerInstance.setProperty) {
        readerInstance.setProperty("--RS__scroll", "readium-scroll-on");
        readerInstance.setProperty("--RS__colCount", "1");
      }

      // The reader manages its own DOM, so we don't need to manually handle iframe
      // Apply initial settings
      if (readerInstance.applyUserSettings) {
        // Map font family to r2d2bc expected values
        const r2d2bcFontFamily = (() => {
          const fontFamilyMap: { [key: string]: string } = {
            "Georgia": "serif",
            "Times New Roman": "serif",
            "Arial": "sans-serif",
            "Helvetica": "sans-serif", 
            "Verdana": "sans-serif",
            "Open Dyslexic": "opendyslexic",
          };
          return fontFamilyMap[fontFamily] || "Original"; // Default fallback
        })();

        const settings = {
          fontSize: fontSize, // Direct percentage value
          fontFamily: r2d2bcFontFamily, // String values: "serif", "sans-serif", "opendyslexic", etc.
          appearance: theme === 'light' ? 'day' : theme === 'sepia' ? 'sepia' : 'night', // String values
          lineHeight: lineHeight, // Direct value
          pageMargins: marginSize, // Direct value
        };
        console.log("Applying initial user settings:", settings);
        readerInstance.applyUserSettings({
          ...settings,
          verticalScroll: true // Ensure scroll mode is enabled
        }).then(() => {
          console.log("Settings applied successfully");
          // Force a refresh of the current view if available
          if (reader.refresh) {
            reader.refresh();
          }
          // Debug: Check what CSS properties are actually set
          if (reader.settings && reader.settings.userProperties) {
            console.log("Current user properties:", reader.settings.userProperties);
          }
          // Debug: Check if iframe is accessible
          if (reader.settings && reader.settings.iframe) {
            console.log("Reader iframe found:", reader.settings.iframe);
            console.log("Iframe content document:", reader.settings.iframe.contentDocument);
          } else {
            console.log("Reader iframe not found in settings");
          }
        }).catch((error: any) => {
          console.error("Error applying initial settings:", error);
        });
      }

      console.log(
        "Reader instance addEventListener:",
        typeof readerInstance.addEventListener
      );

      // Function to calculate and update progress for ENTIRE BOOK using totalProgression
      const updateProgress = () => {
        try {
          // Use the correct r2d2bc API: currentLocator getter
          const locator = readerInstance.currentLocator;
          if (locator) {
            console.log("Current locator:", locator);

            // Set current location from locator
            if (locator.href) {
              setCurrentLocation(locator.href);
            }

            // FIRST PRIORITY: Use totalProgression for entire book progress
            if (
              locator.locations &&
              locator.locations.totalProgression !== undefined
            ) {
              const totalBookProgress = locator.locations.totalProgression;
              setProgress(totalBookProgress);
              console.log(
                "TOTAL BOOK PROGRESS (totalProgression):",
                totalBookProgress
              );
              return;
            }

            // SECOND PRIORITY: Try to get positions and calculate manually
            const positions = readerInstance.positions;
            if (positions && positions.length > 0 && locator.locations) {
              // Find current position in the positions array
              const currentHref = locator.href;
              let currentPositionIndex = -1;

              for (let i = 0; i < positions.length; i++) {
                if (positions[i].href === currentHref) {
                  currentPositionIndex = i;
                  break;
                }
              }

              if (currentPositionIndex >= 0) {
                // Add intra-position progress if available
                const baseProgress =
                  currentPositionIndex / (positions.length - 1);
                const intraProgress = locator.locations.progression || 0;
                const positionContribution = intraProgress / positions.length;
                const totalProgress = Math.min(
                  baseProgress + positionContribution,
                  1
                );

                setProgress(totalProgress);
                console.log(
                  "CALCULATED BOOK PROGRESS from positions:",
                  totalProgress,
                  "Position:",
                  currentPositionIndex + 1,
                  "of",
                  positions.length
                );
                return;
              }
            }

            // THIRD PRIORITY: Manual calculation using spine items
            const currentChapterLink = (readerInstance as any).navigator
              ?.currentChapterLink;
            if (currentChapterLink && (readerInstance as any).publication) {
              const spineItems =
                (readerInstance as any).publication.readingOrder || [];
              const currentIndex = spineItems.findIndex(
                (item: any) =>
                  item.href === currentChapterLink.href ||
                  item.Href === currentChapterLink.href
              );

              if (currentIndex >= 0 && spineItems.length > 0) {
                // Base progress: which chapter we're in
                const chapterBaseProgress = currentIndex / spineItems.length;

                // Intra-chapter progress from CFI
                let chapterProgress = 0;
                if (
                  locator.locations &&
                  locator.locations.progression !== undefined
                ) {
                  chapterProgress = locator.locations.progression;
                } else if (locator.progression !== undefined) {
                  chapterProgress = locator.progression;
                }

                // Total progress = base progress + (chapter progress / total chapters)
                const totalProgress =
                  chapterBaseProgress + chapterProgress / spineItems.length;
                const clampedProgress = Math.min(Math.max(totalProgress, 0), 1);

                setProgress(clampedProgress);
                console.log(
                  "FALLBACK BOOK PROGRESS:",
                  clampedProgress,
                  "Chapter:",
                  currentIndex + 1,
                  "of",
                  spineItems.length,
                  "Chapter progress:",
                  chapterProgress
                );
                return;
              }
            }
          }

          // Last resort: simple chapter-based progress
          const currentChapterLink = (readerInstance as any).navigator
            ?.currentChapterLink;
          if (currentChapterLink && (readerInstance as any).publication) {
            const spineItems =
              (readerInstance as any).publication.readingOrder || [];
            const currentIndex = spineItems.findIndex(
              (item: any) =>
                item.href === currentChapterLink.href ||
                item.Href === currentChapterLink.href
            );

            if (currentIndex >= 0 && spineItems.length > 0) {
              const chapterProgress =
                currentIndex / Math.max(spineItems.length - 1, 1);
              setProgress(chapterProgress);
              console.log(
                "SIMPLE CHAPTER PROGRESS:",
                chapterProgress,
                "Chapter:",
                currentIndex + 1,
                "of",
                spineItems.length
              );
            }
          }
        } catch (error) {
          console.error("Error updating progress:", error);
        }
      };

      // Set up proper r2d2bc event listeners (no setTimeout delays)
      if (readerInstance.addEventListener) {
        // Location/navigation change events
        readerInstance.addEventListener("relocate", (locator: any) => {
          console.log("Relocate event with locator:", locator);
          updateProgress();
        });

        // Page turn events
        readerInstance.addEventListener("turn", () => {
          console.log("Page turn event");
          updateProgress();
        });

        // Click events for navigation
        readerInstance.addEventListener("click", () => {
          console.log("Click event");
          updateProgress();
        });

        // Keyboard navigation events
        readerInstance.addEventListener("keydown", (event: any) => {
          console.log("Keydown event:", event);
          // Update progress on arrow keys, page keys, etc.
          if (
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight" ||
            event.key === "PageUp" ||
            event.key === "PageDown" ||
            event.key === "Home" ||
            event.key === "End"
          ) {
            updateProgress();
          }
        });

        // Resource loading events
        readerInstance.addEventListener("resource.ready", () => {
          console.log("Resource ready event");
          updateProgress();
        });

        readerInstance.addEventListener("resource.start", () => {
          console.log("Resource start event");
          updateProgress();
        });

        readerInstance.addEventListener("resource.end", () => {
          console.log("Resource end event");
          updateProgress();
        });

        readerInstance.addEventListener("resource.fits", () => {
          console.log("Resource fits event");
          updateProgress();
        });

        // Navigation events
        readerInstance.addEventListener("navigate", () => {
          console.log("Navigate event");
          updateProgress();
        });

        // Direction change events
        readerInstance.addEventListener("direction", (direction: any) => {
          console.log("Direction change event:", direction);
          updateProgress();
        });
      }

      // Set up metadata and TOC handling if available
      if (readerInstance.on) {
        readerInstance.on("metadata", (metadata: any) => {
          console.log("Metadata received:", metadata);
          setMetadata({
            title: metadata.title || "Unknown Title",
            author: metadata.author || metadata.creator || "Unknown Author",
            identifier: metadata.identifier || "",
            language: metadata.language || "en",
            description: metadata.description,
            publisher: metadata.publisher,
            publishedDate: metadata.publishedDate || metadata.date,
          });
        });

        readerInstance.on("ready", () => {
          console.log("Reader is ready");
          updateProgress(); // Update progress when ready (no timeout)

          // Get TOC directly from reader property (following r2d2bc example)
          try {
            const tocData = readerInstance.tableOfContents;
            console.log("TOC from reader.tableOfContents:", tocData);

            if (tocData && tocData.length > 0) {
              // Convert r2d2bc TOC format to our format
              const convertTocItem = (item: any, level: number = 0): any => ({
                id: item.href || `toc-${Math.random()}`,
                title: item.title || "Untitled",
                href: item.href,
                level: level,
                children: item.children
                  ? item.children.map((child: any) =>
                      convertTocItem(child, level + 1)
                    )
                  : [],
              });

              const convertedToc = tocData.map((item: any) =>
                convertTocItem(item, 0)
              );
              setToc(convertedToc);
              console.log("Converted TOC:", convertedToc);
            } else {
              console.log("No TOC available from reader.tableOfContents");
              setToc([]);
            }
          } catch (error) {
            console.error("Error getting TOC from reader:", error);
            setToc([]);
          }

          setLoading(false);
        });
      }

      // Initial progress update (no timeout)
      updateProgress();

      setReader(readerInstance);

      // Get TOC as fallback (in case ready event doesn't fire)
      try {
        setTimeout(() => {
          const tocData = readerInstance.tableOfContents;
          console.log("TOC fallback check:", tocData);

          if (tocData && tocData.length > 0) {
            const convertTocItem = (item: any, level: number = 0): any => ({
              id: item.href || `toc-${Math.random()}`,
              title: item.title || "Untitled",
              href: item.href,
              level: level,
              children: item.children
                ? item.children.map((child: any) =>
                    convertTocItem(child, level + 1)
                  )
                : [],
            });

            const convertedToc = tocData.map((item: any) =>
              convertTocItem(item, 0)
            );
            setToc(convertedToc);
            console.log("Fallback TOC set:", convertedToc);
          }
        }, 2000); // Give reader time to load
      } catch (error) {
        console.error("Error in TOC fallback:", error);
      }

      setLoading(false);
    } catch (readerError) {
      console.error("Error in D2Reader initialization:", readerError);
      throw new Error(
        `Failed to initialize reader: ${readerError instanceof Error ? readerError.message : "Unknown error"}`
      );
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const initializeReader = async () => {
      setLoading(true);

      try {
        // Try to load the built D2Reader
        let D2Reader: any;
        try {
          // First try the ES module
          const module = await import("@d-i-t-a/reader");
          D2Reader = module.default || module;
        } catch (esError) {
          console.warn(
            "ES module import failed, trying global script:",
            esError
          );

          // Fallback: load the IIFE version as a script
          const script = document.createElement("script");
          script.src = "/r2d2bc/dist/reader.js";
          script.onload = () => {
            // @ts-ignore
            D2Reader = window.D2Reader;
            if (D2Reader) {
              initializeWithReader(D2Reader);
            } else {
              throw new Error("D2Reader not found in global scope");
            }
          };
          script.onerror = () => {
            throw new Error("Failed to load D2Reader script");
          };
          document.head.appendChild(script);
          return; // Exit early, will continue in script onload
        }

        if (D2Reader) {
          await initializeWithReader(D2Reader);
        } else {
          throw new Error("D2Reader is not available");
        }
      } catch (error) {
        console.error("Failed to initialize EPUB reader:", error);
        setLoading(false);

        // Show error message in the container
        if (containerRef.current) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          containerRef.current.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 20px; text-align: center;">
              <h3>Error Loading EPUB</h3>
              <p>Failed to load the EPUB file: ${epubUrl}</p>
              <p style="color: #666; font-size: 14px;">Error: ${errorMessage}</p>
              <p style="color: #666; font-size: 14px;">Please make sure the EPUB file is accessible and valid.</p>
            </div>
          `;
        }
      }
    };

    initializeReader();

    // Cleanup
    return () => {
      if (reader && reader.destroy) {
        reader.destroy();
      }
    };
  }, [
    epubUrl,
    setReader,
    setLoading,
    setMetadata,
    setToc,
    setProgress,
    setCurrentLocation,
  ]);

  // Apply settings changes to the reader
  useEffect(() => {
    if (reader && reader.applyUserSettings) {
      // Map font family to r2d2bc expected values
      const r2d2bcFontFamily = (() => {
        const fontFamilyMap: { [key: string]: string } = {
          "Georgia": "serif",
          "Times New Roman": "serif", 
          "Arial": "sans-serif",
          "Helvetica": "sans-serif",
          "Verdana": "sans-serif",
          "Open Dyslexic": "opendyslexic",
        };
        return fontFamilyMap[fontFamily] || "Original"; // Default fallback
      })();

      const settings = {
        fontSize: fontSize, // Direct percentage value
        fontFamily: r2d2bcFontFamily, // String values: "serif", "sans-serif", "opendyslexic", etc.
        appearance: theme === 'light' ? 'day' : theme === 'sepia' ? 'sepia' : 'night', // String values
        lineHeight: lineHeight, // Direct value
        pageMargins: marginSize, // Direct value
      };
      console.log("Updating reader settings:", settings);
      
      // Try multiple approaches to apply settings
      const applySettings = async () => {
        try {
          // Approach 1: Use applyUserSettings
          await reader.applyUserSettings({
            ...settings,
            verticalScroll: true // Ensure scroll mode is maintained
          });
          console.log("applyUserSettings completed");

          // Approach 2: If the reader has currentSettings, check what's actually set
          if (reader.currentSettings) {
            console.log("Current reader settings:", reader.currentSettings);
          }

          // Approach 3: Try manual CSS property setting if available
          if (reader.settings && reader.settings.setProperty) {
            console.log("Trying manual CSS property setting");
            reader.settings.setProperty("--USER__fontSize", settings.fontSize.toString());
            reader.settings.setProperty("--USER__fontFamily", settings.fontFamily);
            reader.settings.setProperty("--USER__appearance", settings.appearance);
            reader.settings.setProperty("--USER__lineHeight", settings.lineHeight.toString());
            reader.settings.setProperty("--USER__pageMargins", settings.pageMargins.toString());
          }

          // Approach 4: Force re-render if possible
          if (reader.refresh) {
            reader.refresh();
          } else if (reader.render) {
            reader.render();
          }

          console.log("Settings applied successfully");
          
          // Debug: Check iframe accessibility
          if (reader.settings && reader.settings.iframe) {
            console.log("Reader iframe found:", reader.settings.iframe);
            const doc = reader.settings.iframe.contentDocument;
            if (doc) {
              console.log("Iframe content document accessible");
              const html = doc.querySelector('html');
              if (html) {
                console.log("HTML element found, checking applied styles:");
                console.log("Font size:", html.style.getPropertyValue('--USER__fontSize'));
                console.log("Font family:", html.style.getPropertyValue('--USER__fontFamily'));
                console.log("Appearance:", html.style.getPropertyValue('--USER__appearance'));
              }
            } else {
              console.log("Iframe content document not accessible");
            }
          } else {
            console.log("Reader iframe not found in settings");
          }
        } catch (error: any) {
          console.error("Error applying settings:", error);
        }
      };

      applySettings();
    }
  }, [reader, fontSize, fontFamily, theme, lineHeight, marginSize]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="h6" color="text.secondary">
          Loading EPUB...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {epubUrl}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "auto",
        "& #D2Reader-Container": {
          width: "100%",
          height: "100%",
          overflow: "auto",
        },
        "& #iframe-wrapper": {
          width: "100%",
          height: "100%",
          display: "block",
          overflow: "auto",
        },
        "& iframe": {
          width: "100%",
          border: "none",
        },
        "& .loading": {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        },
        "& .error": {
          display: "none",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        },
        "& @keyframes spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      }}
    />
  );
};
