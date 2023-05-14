import Header from "@/components/home/Header";
import {Typography, Box } from "@mui/material";
import User from "@/context/User";

function Page() {

  return (
    <>
      <Header />
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
    </>
  );
}

export default function Home() {
  return (
    <User>
      <Page />
    </User>
  );
}
