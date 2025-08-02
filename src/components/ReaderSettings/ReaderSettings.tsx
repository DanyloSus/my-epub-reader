import React from "react";
import { useReaderStore } from "store";
import {
  Box,
  Button,
  Divider,
  Drawer,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slider,
  Typography,
} from "ui";

interface ReaderSettingsProps {
  width?: number;
}

export const ReaderSettings: React.FC<ReaderSettingsProps> = ({
  width = 350,
}) => {
  const {
    isSettingsOpen,
    setSettingsOpen,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    theme,
    setTheme,
    lineHeight,
    setLineHeight,
    marginSize,
    setMarginSize,
  } = useReaderStore();

  const handleClose = () => {
    setSettingsOpen(false);
  };

  const handleFontFamilyChange = (event: SelectChangeEvent) => {
    setFontFamily(event.target.value);
  };

  const handleThemeChange = (event: SelectChangeEvent) => {
    setTheme(event.target.value as "light" | "dark" | "sepia");
  };

  const fontFamilies = [
    { value: "Georgia", label: "Georgia" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Arial", label: "Arial" },
    { value: "Helvetica", label: "Helvetica" },
    { value: "Verdana", label: "Verdana" },
    { value: "Open Dyslexic", label: "Open Dyslexic" },
  ];

  const themes = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "sepia", label: "Sepia" },
  ];

  return (
    <Drawer
      anchor="right"
      open={isSettingsOpen}
      onClose={handleClose}
      PaperProps={{
        sx: { width },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Reading Settings
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Font Size
          </Typography>
          <Slider
            value={fontSize}
            onChange={(_, value) => setFontSize(value as number)}
            min={12}
            max={24}
            step={1}
            marks
            valueLabelDisplay="auto"
            sx={{ mb: 3 }}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Font Family</InputLabel>
            <Select
              value={fontFamily}
              label="Font Family"
              onChange={handleFontFamilyChange}
            >
              {fontFamilies.map((font) => (
                <MenuItem key={font.value} value={font.value}>
                  {font.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Theme</InputLabel>
            <Select value={theme} label="Theme" onChange={handleThemeChange}>
              {themes.map((themeOption) => (
                <MenuItem key={themeOption.value} value={themeOption.value}>
                  {themeOption.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Line Height
          </Typography>
          <Slider
            value={lineHeight}
            onChange={(_, value) => setLineHeight(value as number)}
            min={1.0}
            max={2.0}
            step={0.1}
            marks
            valueLabelDisplay="auto"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Margin Size
          </Typography>
          <Slider
            value={marginSize}
            onChange={(_, value) => setMarginSize(value as number)}
            min={0}
            max={4}
            step={1}
            marks
            valueLabelDisplay="auto"
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Button variant="outlined" fullWidth onClick={handleClose}>
          Close Settings
        </Button>
      </Box>
    </Drawer>
  );
};
