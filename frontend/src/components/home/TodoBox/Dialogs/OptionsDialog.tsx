import { todoItem } from "@/pages/home/[[...fieldPath]]";
import {
  Dialog,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";

export default function OptionsDialog(props: {
  todoItem: todoItem;
  onClose: (
    apply: boolean,
    values?: {
      todoItemId: string;
      labelValue: string;
      mustAttendValue: boolean;
      recurringValue: string;
    }
  ) => void;
}) {
  const { todoItem, onClose } = props;

  const [labelValue, setLabelValue] = useState<string>(props.todoItem.label);
  const [mustAttendValue, setMustAttendValue] = useState<string>(
    props.todoItem.options.mustBeAttended ? "yes" : "no"
  );
  const [recurringValue, setRecurringValue] = useState<string>(
    props.todoItem.options.recurring
  );
  const [loading, setLoading] = useState<boolean>(false);

  function onCloseCancel() {
    onClose(false);
  }

  function onCloseApply() {
    setLoading(true);
    onClose(true, {
      todoItemId: todoItem._id,
      labelValue: labelValue,
      mustAttendValue: mustAttendValue === "yes" ? true : false,
      recurringValue: recurringValue,
    });
  }

  return (
    <Dialog open={true} onClose={onCloseCancel} maxWidth={"xs"}>
      <Card>
        <CardContent>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <TextField
                label={"Label"}
                autoComplete="off"
                value={labelValue}
                onChange={(event) => {
                  setLabelValue(event.target.value);
                }}
                fullWidth={true}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl>
                <FormLabel>Must be attended</FormLabel>
                <RadioGroup
                  row
                  value={mustAttendValue}
                  onChange={(event) => {
                    setMustAttendValue(event.target.value);
                  }}
                >
                  <FormControlLabel value="no" control={<Radio />} label="No"/>
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={"Recurring"}
                autoComplete="off"
                value={recurringValue}
                onChange={(event) => {
                  setRecurringValue(event.target.value);
                }}
              />
            </Grid>
            {loading && (
              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <CircularProgress />
              </Grid>
            )}
            <Grid item xs={12}>
              {" "}
              <Button variant="contained" fullWidth onClick={onCloseApply}>
                OK
              </Button>
            </Grid>
            <Grid item xs={12}>
              {" "}
              <Button variant="contained" fullWidth onClick={onCloseCancel}>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Dialog>
  );
}
