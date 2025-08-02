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
        const response = await fetch(url.toString(), { method: 'HEAD' });
        console.log("URL test response:", response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (fetchError) {
        console.error("URL accessibility test failed:", fetchError);
        throw new Error(`Cannot access EPUB URL: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
      }

      // Initialize the reader with the manifest file
      console.log("Initializing D2Reader with URL:", url.toString());
      const readerInstance = await D2Reader.load({
        url: url,
        injectables: [],
        injectablesFixed: [],
      });

      console.log("Reader instance created:", readerInstance);

      // The reader manages its own DOM, so we don't need to manually handle iframe
      // Apply initial settings
      if (readerInstance.applyUserSettings) {
        readerInstance.applyUserSettings({
          fontSize,
          fontFamily,
          theme,
          lineHeight,
          marginSize,
        });
      }

      // Set up event listeners
      if (readerInstance.on) {
        readerInstance.on("location", (location: any) => {
          console.log("Location changed:", location);
          setCurrentLocation(location.href || location.toString());
          setProgress(location.progress || 0);
        });

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

        readerInstance.on("toc", (toc: any) => {
          console.log("TOC received:", toc);
          setToc(toc || []);
        });

        readerInstance.on("ready", () => {
          console.log("Reader is ready");
          setLoading(false);
        });
      }

      setReader(readerInstance);

      // If no 'ready' event, set loading to false after a delay
      setTimeout(() => {
        setLoading(false);
      }, 3000);

    } catch (readerError) {
      console.error("Error in D2Reader initialization:", readerError);
      throw new Error(`Failed to initialize reader: ${readerError instanceof Error ? readerError.message : 'Unknown error'}`);
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
      reader.applyUserSettings({
        fontSize,
        fontFamily,
        theme,
        lineHeight,
        marginSize,
      });
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
        overflow: "hidden",
        "& #D2Reader-Container": {
          width: "100%",
          height: "100%",
        },
        "& #iframe-wrapper": {
          width: "100%",
          height: "100%",
          display: "block",
        },
        "& iframe": {
          width: "100%",
          height: "100%",
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
