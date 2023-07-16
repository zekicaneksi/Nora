import "@/styles/globals.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { AppProps } from "next/app";

declare module '@mui/material/styles' {
  interface TypeBackground {
    glow: string,
  }
}



const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E2E3A',
    },
    secondary: {
      main: '#8C86AA',
    },
    background: {
      default: '#d6ba95',
      paper: '#c3a67b',
      glow: '#eadac4'
    },
    warning: {
      main: '#F34213',
    },
    info: {
      main: '#41EAD4',
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
