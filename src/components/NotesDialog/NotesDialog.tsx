import React from "react";
import { useReaderStore } from "../../store";
import { Highlight } from "../../types";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "../../ui";

interface NotesDialogProps {
  open: boolean;
  onClose: () => void;
}

export const NotesDialog: React.FC<NotesDialogProps> = ({ open, onClose }) => {
  const { highlights, removeHighlight, goToLocation } = useReaderStore();

  const handleGoToHighlight = (highlight: Highlight) => {
    goToLocation({
      href: highlight.href,
      locations: { cfi: highlight.cfi },
    });
    onClose();
  };

  const handleDeleteHighlight = (id: string) => {
    removeHighlight(id);
  };

  const getColorName = (color: string) => {
    const colorMap: { [key: string]: string } = {
      "#FFFF00": "Yellow",
      "#00FF00": "Green",
      "#00BFFF": "Blue",
      "#FF69B4": "Pink",
      "#FFA500": "Orange",
      "#9370DB": "Purple",
    };
    return colorMap[color] || "Unknown";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Notes & Highlights ({highlights.length})</DialogTitle>

      <DialogContent>
        {highlights.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 4,
              color: "text.secondary",
            }}
          >
            <Typography variant="h6" gutterBottom>
              No highlights yet
            </Typography>
            <Typography variant="body2">
              Select text in the book to create your first highlight and note.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {highlights.map((highlight) => (
              <Box
                key={highlight.id}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "grey.200",
                  borderRadius: 1,
                  backgroundColor: "grey.50",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1,
                  }}
                >
                  <Chip
                    label={getColorName(highlight.color)}
                    size="small"
                    sx={{
                      backgroundColor: highlight.color,
                      color: "black",
                    }}
                  />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleGoToHighlight(highlight)}
                    >
                      Go to
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteHighlight(highlight.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>

                <Box
                  sx={{
                    p: 1.5,
                    backgroundColor: highlight.color,
                    borderRadius: 0.5,
                    mb: highlight.note ? 1 : 0,
                    fontStyle: "italic",
                  }}
                >
                  "{highlight.text}"
                </Box>

                {highlight.note && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Note:
                    </Typography>
                    <Typography variant="body2" sx={{ pl: 1 }}>
                      {highlight.note}
                    </Typography>
                  </Box>
                )}

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  {new Date(highlight.timestamp).toLocaleDateString()} at{" "}
                  {new Date(highlight.timestamp).toLocaleTimeString()}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
