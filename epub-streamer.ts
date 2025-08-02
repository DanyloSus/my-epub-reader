import { Server } from "dita-streamer-js";
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start() {
  const server = new Server({
    disableDecryption: true,
    disableOPDS: true,
    disableReaders: false,
    disableRemotePubUrl: true,
    maxPrefetchLinks: 5,
  });

  // Serve static files
  server.expressUse(
    "/",
    express.static(path.join(__dirname, "public"), { fallthrough: true })
  );

  // Add our EPUB file
  const epubPath = path.join(__dirname, "public", "games.epub");
  console.log("Adding EPUB:", epubPath);
  
  try {
    const publicationURLs = server.addPublications([epubPath]);
    console.log("Publication URLs:", publicationURLs);
    
    if (publicationURLs.length > 0) {
      console.log("Games EPUB available at:", publicationURLs[0]);
    }
  } catch (error) {
    console.error("Error adding EPUB:", error);
  }

  const data = await server.start(4444, false);
  console.log(`EPUB streaming server running at: http://localhost:${data.urlPort}`);
  
  return server;
}

export default start;

// Check if this is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  start().catch(console.error);
}
