import React, { useEffect, useState } from "react";
import { Highlight } from "../../types";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "../../ui";

interface NoteCreationModalProps {
  open: boolean;
  onClose: () => void;
  selectedText: string;
  onSave: (highlight: Omit<Highlight, "id" | "timestamp">) => void;
  cfi: string;
  href: string;
}

const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#FFFF00", rgb: "255, 255, 0" },
  { name: "Green", value: "#00FF00", rgb: "0, 255, 0" },
  { name: "Blue", value: "#00BFFF", rgb: "0, 191, 255" },
  { name: "Pink", value: "#FF69B4", rgb: "255, 105, 180" },
  { name: "Orange", value: "#FFA500", rgb: "255, 165, 0" },
  { name: "Purple", value: "#9370DB", rgb: "147, 112, 219" },
];

export const NoteCreationModal: React.FC<NoteCreationModalProps> = ({
  open,
  onClose,
  selectedText,
  onSave,
  cfi,
  href,
}) => {
  const [note, setNote] = useState("");
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[0]);

  useEffect(() => {
    if (open) {
      setNote("");
      setSelectedColor(HIGHLIGHT_COLORS[0]);
    }
  }, [open]);

  const handleSave = () => {
    const highlight: Omit<Highlight, "id" | "timestamp"> = {
      cfi,
      href,
      text: selectedText,
      color: selectedColor.value,
      note: note.trim() || undefined,
    };

    onSave(highlight);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>Add Note & Highlight</DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Text:
          </Typography>
          <Box
            sx={{
              p: 2,
              backgroundColor: "grey.50",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "grey.200",
              fontStyle: "italic",
              maxHeight: 120,
              overflow: "auto",
            }}
          >
            "{selectedText}"
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Highlight Color:
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {HIGHLIGHT_COLORS.map((color) => (
              <Chip
                key={color.value}
                label={color.name}
                onClick={() => setSelectedColor(color)}
                sx={{
                  backgroundColor: color.value,
                  color: "black",
                  border: selectedColor.value === color.value ? 2 : 0,
                  borderColor: "primary.main",
                  "&:hover": {
                    backgroundColor: color.value,
                    opacity: 0.8,
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Note (optional):
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={note}
            onChange={(
              e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => setNote(e.target.value)}
            placeholder="Add your thoughts about this passage..."
            variant="outlined"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save Highlight
        </Button>
      </DialogActions>
    </Dialog>
  );
};
