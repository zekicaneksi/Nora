import { todoItem } from "@/pages/home/[[...fieldPath]]";
import { Dialog, Card, CardContent, TextField, Button, CircularProgress } from "@mui/material";
import { useState } from "react";

export default function ContentDialog(props: {
  todoItem: todoItem;
  onClose: (apply: boolean, value?: string) => void;
}) {
  const { todoItem, onClose } = props;

  const [textFieldValue, setTextFieldValue] = useState<string | undefined>(todoItem.content)
    const [loading, setLoading] = useState<boolean>(false)

    function handleOKBtn(){
        setLoading(true)
        onClose(true,textFieldValue)
    }

  return (
    <Dialog open={true} onClose={() => {onClose(false)}} fullWidth={true}>
      <Card>
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <TextField
            label="Content"
            multiline
            rows={4}
            value={textFieldValue}
            onChange={(event) => {setTextFieldValue(event.target.value)}}
            fullWidth={true}
          />
          {loading && <CircularProgress sx={{alignSelf: 'center'}}/>}
          <Button variant="contained" onClick={handleOKBtn}>OK</Button>
        </CardContent>
      </Card>
    </Dialog>
  );
}
