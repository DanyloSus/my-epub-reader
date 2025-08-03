import {
  AddComment as AddCommentIcon,
  ArrowBack,
  ArrowForward,
  Menu as MenuIcon,
  Notes as NotesIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import React, { useState } from "react";
import { useReaderStore } from "store";
import { AppBar, Box, IconButton, Toolbar, Typography } from "ui";
import { NotesDialog } from "../NotesDialog";

interface ReaderToolbarProps {
  title?: string;
  showNavigation?: boolean;
}

export const ReaderToolbar: React.FC<ReaderToolbarProps> = ({
  title = "EPUB Reader",
  showNavigation = true,
}) => {
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const {
    isTocOpen,
    isSettingsOpen,
    setTocOpen,
    setSettingsOpen,
    nextPage,
    previousPage,
    progress,
    highlights,
    setSelectedText,
    setNoteModalOpen,
  } = useReaderStore();

  const handleTocToggle = () => {
    setTocOpen(!isTocOpen);
  };

  const handleSettingsToggle = () => {
    setSettingsOpen(!isSettingsOpen);
  };

  // Test function to manually trigger note creation
  const handleTestNoteCreation = () => {
    setSelectedText("This is a test selection", "test-cfi", "test-href");
    setNoteModalOpen(true);
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

        <IconButton
          color="inherit"
          aria-label="test note creation"
          onClick={handleTestNoteCreation}
          sx={{ ml: 1 }}
          title="Test Note Creation"
        >
          <AddCommentIcon />
        </IconButton>

        <IconButton
          color="inherit"
          aria-label="notes and highlights"
          onClick={() => setIsNotesOpen(true)}
          sx={{ ml: 1 }}
        >
          <NotesIcon />
          {highlights.length > 0 && (
            <Box
              component="span"
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "error.main",
                color: "white",
                borderRadius: "50%",
                width: 16,
                height: 16,
                fontSize: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {highlights.length}
            </Box>
          )}
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

      <NotesDialog open={isNotesOpen} onClose={() => setIsNotesOpen(false)} />
    </AppBar>
  );
};
