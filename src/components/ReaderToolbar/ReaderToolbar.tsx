import {
  ArrowBack,
  ArrowForward,
  Bookmark as BookmarkIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import React from "react";
import { useReaderStore } from "store";
import { AppBar, Box, IconButton, Toolbar, Typography } from "ui";

interface ReaderToolbarProps {
  title?: string;
  showNavigation?: boolean;
}

export const ReaderToolbar: React.FC<ReaderToolbarProps> = ({
  title = "EPUB Reader",
  showNavigation = true,
}) => {
  const {
    isTocOpen,
    isSettingsOpen,
    setTocOpen,
    setSettingsOpen,
    nextPage,
    previousPage,
    progress,
    reader,
  } = useReaderStore();

  const handleTocToggle = () => {
    setTocOpen(!isTocOpen);
  };

  const handleSettingsToggle = () => {
    setSettingsOpen(!isSettingsOpen);
  };

  const toggleScrollMode = () => {
    if (reader && reader.scroll) {
      const isCurrentlyScrolling =
        reader.currentSettings?.verticalScroll ?? false;
      reader.scroll(!isCurrentlyScrolling);
    }
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="table of contents"
          onClick={handleTocToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        {showNavigation && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {Math.round(progress * 100)}%
            </Typography>

            <IconButton
              color="inherit"
              aria-label="previous page"
              onClick={previousPage}
            >
              <ArrowBack />
            </IconButton>

            <IconButton
              color="inherit"
              aria-label="next page"
              onClick={nextPage}
            >
              <ArrowForward />
            </IconButton>
          </Box>
        )}

        <IconButton color="inherit" aria-label="bookmarks" sx={{ ml: 1 }}>
          <BookmarkIcon />
        </IconButton>

        <IconButton
          color="inherit"
          aria-label="settings"
          onClick={handleSettingsToggle}
          sx={{ ml: 1 }}
        >
          <SettingsIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
