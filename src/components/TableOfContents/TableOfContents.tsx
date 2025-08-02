import {
  BookmarkAdd,
  Bookmark as BookmarkIcon,
  BookmarkRemove,
} from "@mui/icons-material";
import React, { useState } from "react";
import { useReaderStore } from "store";
import { Bookmark, TocItem } from "types";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "ui";

interface TableOfContentsProps {
  width?: number;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  width = 300,
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const {
    isTocOpen,
    setTocOpen,
    toc,
    bookmarks,
    goToLocation,
    metadata,
    createBookmark,
    removeBookmark,
  } = useReaderStore();

  const handleClose = () => {
    setTocOpen(false);
  };

  const handleTocItemClick = (item: TocItem) => {
    goToLocation(item.href);
    handleClose();
  };

  const handleBookmarkClick = (bookmark: Bookmark) => {
    if (bookmark.cfi) {
      goToLocation({ href: bookmark.href, locations: { cfi: bookmark.cfi } });
    } else {
      goToLocation(bookmark.href);
    }
    handleClose();
  };

  const handleCreateBookmark = () => {
    console.log("handleCreateBookmark called");
    const result = createBookmark();
    console.log("createBookmark result:", result);
  };

  const handleRemoveBookmark = (bookmarkId: string) => {
    removeBookmark(bookmarkId);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
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

  const renderBookmarkItem = (bookmark: Bookmark) => (
    <ListItem key={bookmark.id} disablePadding>
      <ListItemButton onClick={() => handleBookmarkClick(bookmark)}>
        <ListItemText
          primary={bookmark.title}
          secondary={
            <>
              {bookmark.excerpt && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {bookmark.excerpt}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {bookmark.timestamp.toLocaleDateString()}
              </Typography>
            </>
          }
        />
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveBookmark(bookmark.id);
          }}
        >
          <BookmarkRemove />
        </IconButton>
      </ListItemButton>
    </ListItem>
  );

  return (
    <Drawer
      anchor="left"
      open={isTocOpen}
      onClose={handleClose}
      PaperProps={{
        sx: { width },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header */}
        <Box sx={{ p: 2, pb: 0 }}>
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
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="reader navigation tabs"
          >
            <Tab label="Contents" />
            <Tab
              label={`Bookmarks (${bookmarks.length})`}
              icon={<BookmarkIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {currentTab === 0 && (
            // Table of Contents Tab
            <>
              {toc.length > 0 ? (
                <List dense>{renderTocItems(toc)}</List>
              ) : (
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No table of contents available
                  </Typography>
                </Box>
              )}
            </>
          )}

          {currentTab === 1 && (
            // Bookmarks Tab
            <Box sx={{ p: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                  px: 1,
                }}
              >
                <Typography variant="subtitle2">Bookmarks</Typography>
                <Tooltip title="Add bookmark at current location">
                  <IconButton onClick={handleCreateBookmark} size="small">
                    <BookmarkAdd />
                  </IconButton>
                </Tooltip>
              </Box>

              {bookmarks.length > 0 ? (
                <List dense>
                  {bookmarks.map((bookmark) => renderBookmarkItem(bookmark))}
                </List>
              ) : (
                <Box sx={{ p: 2, textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    No bookmarks yet
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Click the + button above to add a bookmark at your current
                    reading position
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};
