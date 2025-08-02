import React from "react";
import { useReaderStore } from "store";
import { TocItem } from "types";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "ui";

interface TableOfContentsProps {
  width?: number;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  width = 300,
}) => {
  const { isTocOpen, setTocOpen, toc, goToLocation, metadata } =
    useReaderStore();

  const handleClose = () => {
    setTocOpen(false);
  };

  const handleTocItemClick = (item: TocItem) => {
    goToLocation(item.href);
    handleClose();
  };

  const renderTocItem = (item: TocItem, level: number = 0) => (
    <ListItem key={item.id} disablePadding>
      <ListItemButton
        onClick={() => handleTocItemClick(item)}
        sx={{
          pl: 2 + level * 2,
          py: 0.5,
        }}
      >
        <ListItemText
          primary={item.title}
          primaryTypographyProps={{
            variant: level === 0 ? "subtitle2" : "body2",
            fontWeight: level === 0 ? 500 : 400,
          }}
        />
      </ListItemButton>
    </ListItem>
  );

  const renderTocItems = (
    items: TocItem[],
    level: number = 0
  ): React.ReactNode[] => {
    return items.flatMap((item) => [
      renderTocItem(item, level),
      ...(item.children ? renderTocItems(item.children, level + 1) : []),
    ]);
  };

  return (
    <Drawer
      anchor="left"
      open={isTocOpen}
      onClose={handleClose}
      PaperProps={{
        sx: { width },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Table of Contents
        </Typography>

        {metadata && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {metadata.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              by {metadata.author}
            </Typography>
          </Box>
        )}

        <Divider sx={{ mb: 1 }} />
      </Box>

      {toc.length > 0 ? (
        <List dense>{renderTocItems(toc)}</List>
      ) : (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No table of contents available
          </Typography>
        </Box>
      )}
    </Drawer>
  );
};
