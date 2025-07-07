import {
  createTheme,
  PaletteColor,
  PaletteColorOptions,
} from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    tertiary: PaletteColor;
  }
  interface PaletteOptions {
    white?: PaletteColorOptions;
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: "#273F4F",
    },
    secondary: {
      main: "#40534C",
    },
    success: {
      main: "#677D6A",
    },
    warning: {
      main: "#D6BD98",
    },
    white: {
      light: "#ffffff",
      main: "#ffffff",
      dark: "#ffffff",
      contrastText: "#1A3636",
    },
  },
});

export default theme;
