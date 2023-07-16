import { todoItem } from "@/pages/home/[[...fieldPath]]";
import {
  Dialog,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";

export default function ContentDialog(props: {
  todoItem: todoItem;
  onClose: (apply: boolean, value?: string) => void;
}) {
  const { todoItem, onClose } = props;

  const [textFieldValue, setTextFieldValue] = useState<string | undefined>(
    todoItem.content
  );
  const [loading, setLoading] = useState<boolean>(false);

  function handleOKBtn() {
    setLoading(true);
    onClose(true, textFieldValue);
  }

  return (
    <Dialog
      open={true}
      onClose={() => {
        onClose(false);
      }}
      fullWidth={true}
      PaperProps={{ sx: { height: "100%" } }}
    >
      <Card sx={{ height: "100%" }}>
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "20px",
            height: "100%",
            boxSizing: "border-box",
          }}
        >
          <TextField
            label="Content"
            multiline
            value={textFieldValue}
            onChange={(event) => {
              setTextFieldValue(event.target.value);
            }}
            fullWidth={true}
            sx={{
              height: "100%",
              "& .MuiInputBase-root": {
                height: "100%",
              },
              "& textarea": { height: "100% !important" },
            }}
          />
          {loading && <CircularProgress sx={{ alignSelf: "center" }} />}
          <Button variant="contained" onClick={handleOKBtn}>
            OK
          </Button>
        </CardContent>
      </Card>
    </Dialog>
  );
}
