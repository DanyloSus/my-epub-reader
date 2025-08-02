import React, { useState } from 'react';
import { Box, Button } from 'ui';
import {
  ReaderToolbar,
  TableOfContents,
  ReaderSettings,
  ReaderViewport,
} from 'components';
import { useReaderStore } from 'store';

export const ReaderPage: React.FC = () => {
  const { metadata } = useReaderStore();
  const [epubSource, setEpubSource] = useState<'demo' | 'local'>('local');
  
  const epubUrls = {
    demo: 'https://d-i-t-a.github.io/R2D2BC/viewer/manifest.json',
    local: 'http://localhost:4444/pub/L2hvbWUvZGFueWxvL215LWVwdWItcmVhZGVyL3B1YmxpYy9nYW1lcy5lcHVi/manifest.json',
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <ReaderToolbar 
        title={metadata?.title || 'EPUB Reader'} 
        showNavigation={true}
      />
      
      <Box
        sx={{
          p: 1,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <Button
          variant={epubSource === 'demo' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => setEpubSource('demo')}
        >
          Demo EPUB
        </Button>
        <Button
          variant={epubSource === 'local' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => setEpubSource('local')}
        >
          Local EPUB (games.epub)
        </Button>
      </Box>
      
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <ReaderViewport epubUrl={epubUrls[epubSource]} />
      </Box>

      <TableOfContents />
      <ReaderSettings />
    </Box>
  );
};
