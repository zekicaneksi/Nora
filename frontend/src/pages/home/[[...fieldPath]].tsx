import Header from "@/components/home/Header";
import { Button, Typography, Box } from "@mui/material";

import {backendGET} from "@/utils/backendFetch"

export default function Home() {

  function testBackend(){
    backendGET('/testBackend', (response) => {
      console.log(response);
    });
  }

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
      <Button onClick={testBackend}>Test backend</Button>
    </>
  );
}
