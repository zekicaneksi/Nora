import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  Typography,
} from "@mui/material";
import { useState } from "react";

export default function TodoBoxRemoveDialog(props: {
  onClose: (remove: boolean) => void;
}) {
  const { onClose } = props;

  const [loading, setLoading] = useState<boolean>(false)

  return (
    <Dialog open={true} onClose={() => {onClose(false)}} fullWidth={true}>
      <Card>
        <CardContent sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "20px",
          }}>
          <Typography
            textAlign={"center"}
            marginBottom={"2rem"}
            marginTop={"2rem"}
          >
            Are sure you want to remove this box?
          </Typography>
          {loading && <CircularProgress sx={{alignSelf: 'center'}}/>}
          <Box sx={{ display: "flex", flexDirection: "row", gap: "2rem" }}>
            <Button variant="contained" fullWidth={true} onClick={() => {onClose(true); setLoading(true)}}>
              Yes
            </Button>
            <Button variant="contained" fullWidth={true} onClick={() => {onClose(false)}}>
              No
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Dialog>
  );
}
