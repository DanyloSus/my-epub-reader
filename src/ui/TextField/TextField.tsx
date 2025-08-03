import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
} from "@mui/material";
import React from "react";

export interface TextFieldProps extends Omit<MuiTextFieldProps, "onChange"> {
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export const TextField: React.FC<TextFieldProps> = (props) => {
  return <MuiTextField {...props} />;
};
