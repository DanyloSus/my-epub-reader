import {
  Dialog as MuiDialog,
  DialogActions as MuiDialogActions,
  DialogContent as MuiDialogContent,
  DialogContentText as MuiDialogContentText,
  DialogProps as MuiDialogProps,
  DialogTitle as MuiDialogTitle,
} from "@mui/material";
import React from "react";

export interface DialogProps extends MuiDialogProps {}

export const Dialog: React.FC<DialogProps> = (props) => {
  return <MuiDialog {...props} />;
};

export const DialogTitle = MuiDialogTitle;
export const DialogContent = MuiDialogContent;
export const DialogActions = MuiDialogActions;
export const DialogContentText = MuiDialogContentText;
