import { Chip as MuiChip, ChipProps as MuiChipProps } from "@mui/material";
import React from "react";

export interface ChipProps extends MuiChipProps {}

export const Chip: React.FC<ChipProps> = (props) => {
  return <MuiChip {...props} />;
};
