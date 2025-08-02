import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    reader: {
      background: string;
      sidebar: string;
      toolbar: string;
      text: string;
      accent: string;
    };
  }

  interface PaletteOptions {
    reader?: {
      background?: string;
      sidebar?: string;
      toolbar?: string;
      text?: string;
      accent?: string;
    };
  }
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    reader: {
      background: '#ffffff',
      sidebar: '#f8f9fa',
      toolbar: '#ffffff',
      text: '#333333',
      accent: '#1976d2',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },
});
