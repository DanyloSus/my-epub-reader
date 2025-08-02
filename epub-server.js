const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3003;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  methods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Range', 'Content-Range', 'Content-Length', 'Content-Type', 'Authorization'],
  credentials: false
}));

// Add additional CORS headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Range, Content-Range, Content-Length, Content-Type');
  res.header('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files from public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve the EPUB file with proper headers
app.get('/epub/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'EPUB file not found' });
  }
  
  // Set proper headers for EPUB files
  res.setHeader('Content-Type', 'application/epub+zip');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Range, Content-Length');
  
  // Handle range requests for streaming
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'application/epub+zip',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'application/epub+zip',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Create a simple manifest endpoint for r2d2bc
app.get('/manifest/:filename', (req, res) => {
  const filename = req.params.filename;
  const epubUrl = `http://localhost:${PORT}/epub/${filename}`;
  
  // Create a proper ReadiumWebPubManifest structure that r2d2bc expects
  const manifest = {
    "@context": [
      "https://readium.org/webpub-manifest/context.jsonld"
    ],
    "metadata": {
      "title": filename.replace('.epub', ''),
      "identifier": `epub-${Date.now()}`,
      "language": "en"
    },
    "links": [
      {
        "rel": "self",
        "href": `http://localhost:${PORT}/manifest/${filename}`,
        "type": "application/webpub+json"
      }
    ],
    "readingOrder": [
      {
        "href": epubUrl,
        "type": "application/epub+zip",
        "title": filename.replace('.epub', '')
      }
    ]
  };
  
  res.json(manifest);
});

app.listen(PORT, () => {
  console.log(`EPUB server running on http://localhost:${PORT}`);
  console.log(`Available EPUBs:`);
  console.log(`- http://localhost:${PORT}/epub/games.epub`);
  console.log(`- http://localhost:${PORT}/manifest/games.epub`);
});
