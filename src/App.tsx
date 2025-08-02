import { CssBaseline, ThemeProvider } from "@mui/material";
import { ReaderPage } from "pages";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { theme } from "./theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<ReaderPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
