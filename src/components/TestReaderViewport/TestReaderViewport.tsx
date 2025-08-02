import React, { useEffect, useRef, useState } from "react";
import { Box, Button, CircularProgress, Typography } from "ui";

export const TestReaderViewport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<string>("Initializing...");
  const [error, setError] = useState<string | null>(null);

  const testD2Reader = async () => {
    try {
      setStatus("Loading D2Reader library...");

      // Try to load the built D2Reader
      let D2Reader: any;
      try {
        const module = await import("@d-i-t-a/reader");
        D2Reader = module.default || module;
        setStatus("D2Reader library loaded successfully");
      } catch (esError) {
        setStatus("ES module failed, trying script...");

        // Fallback: load the IIFE version as a script
        const script = document.createElement("script");
        script.src = "/r2d2bc/dist/reader.js";
        script.onload = () => {
          // @ts-ignore
          D2Reader = window.D2Reader;
          if (D2Reader) {
            setStatus("D2Reader loaded via script");
          } else {
            throw new Error("D2Reader not found in global scope");
          }
        };
        script.onerror = () => {
          throw new Error("Failed to load D2Reader script");
        };
        document.head.appendChild(script);
        return;
      }

      if (D2Reader) {
        setStatus("D2Reader available - library test successful");
        console.log("D2Reader object:", D2Reader);
        console.log("D2Reader methods:", Object.getOwnPropertyNames(D2Reader));
      }
    } catch (error) {
      console.error("D2Reader test failed:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      setStatus("Failed to load D2Reader");
    }
  };

  useEffect(() => {
    testD2Reader();
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        p: 3,
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="h6" color="text.primary">
        D2Reader Library Test
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {status}
      </Typography>
      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          Error: {error}
        </Typography>
      )}
      <Button variant="outlined" onClick={testD2Reader} sx={{ mt: 2 }}>
        Retry Test
      </Button>
    </Box>
  );
};
