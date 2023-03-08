import styles from "@/styles/Home.module.css";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";

export default function Home() {
  return (
    <Box
      sx={{
        width: 300,
        height: 300,
        backgroundColor: "primary.dark",
        "&:hover": {
          backgroundColor: "primary.main",
          opacity: [0.9, 0.8, 0.7],
        },
      }}
    >
      <Typography>Hello</Typography>
    </Box>
  );
}
