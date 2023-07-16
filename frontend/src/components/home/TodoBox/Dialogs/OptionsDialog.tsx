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
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import { useState } from "react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function OptionsDialog(props: {
  todoItem: todoItem;
  onClose: (
    apply: boolean,
    values?: {
      todoItemId: string;
      labelValue: string;
      mustAttendValue: boolean;
      recurringValue: {
        startDate: number;
        frequency: number;
        isRecurring: boolean;
        lastCheck: number;
      };
    }
  ) => void;
}) {
  const { todoItem, onClose } = props;

  const theme = useTheme();

  const [labelValue, setLabelValue] = useState<string>(props.todoItem.label);
  const [mustAttendValue, setMustAttendValue] = useState<string>(
    props.todoItem.options.mustBeAttended ? "yes" : "no"
  );
  const [isRecurringValue, setIsRecurringValue] = useState<string>(
    props.todoItem.options.recurring.isRecurring ? "yes" : "no"
  );
  const [recurringStartDate, setRecurringStartDate] = useState(
    new Date(
      props.todoItem.options.recurring.startDate.valueOf() === 0
        ? Date.now()
        : props.todoItem.options.recurring.startDate
    )
  );
  const [recurringFrequency, setRecurringFrequency] = useState(
    props.todoItem.options.recurring.frequency
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
      recurringValue: {
        startDate: recurringStartDate.getTime(),
        frequency: recurringFrequency,
        isRecurring: isRecurringValue === "yes" ? true : false,
        lastCheck: todoItem.options.recurring.lastCheck,
      },
    });
  }

  let holdDateTime: string[] = recurringStartDate
    .toTimeString()
    .split(" ")[0]
    .split(":");
  holdDateTime.pop();
  const dateTime = holdDateTime.join(":");

  function frequencyFieldOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = parseInt(event.target.value);
    if (value) setRecurringFrequency(value);
    else setRecurringFrequency(0);
  }

  return (
    <Dialog
      open={true}
      onClose={onCloseCancel}
      maxWidth={"xs"}
      PaperProps={{ sx: { overflow: "visible" } }}
    >
      <Card sx={{ overflow: "visible" }}>
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
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl>
                <FormLabel>Recurring</FormLabel>
                <RadioGroup
                  row
                  value={isRecurringValue}
                  onChange={(event) => {
                    setIsRecurringValue(event.target.value);
                  }}
                >
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                  />
                </RadioGroup>
                <Box
                  sx={{
                    ...(isRecurringValue === "no"
                      ? {
                          opacity: 0.5,
                          "&:hover": {
                            cursor: "not-allowed",
                          },
                        }
                      : {}),
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2 , '& input': {backgroundColor: theme.palette.background.default}}}>
                    <Typography whiteSpace={"nowrap"}>Start Date:</Typography>
                    <DatePicker
                      selected={new Date(recurringStartDate)}
                      onChange={(date) => {
                        if (date !== null)
                          setRecurringStartDate((prevState) => {
                            let [hour, minute] = dateTime.split(":");
                            let toReturn = new Date(date);
                            toReturn.setHours(
                              parseInt(hour),
                              parseInt(minute),
                              0,
                              0
                            );
                            return toReturn;
                          });
                      }}
                    />
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, marginTop: 1 }}>
                    <Typography whiteSpace={"nowrap"}>Start Time:</Typography>
                    <input
                      type="time"
                      value={dateTime}
                      style={{backgroundColor: theme.palette.background.default}}
                      onChange={(event) => {
                        setRecurringStartDate((prevState) => {
                          let [hour, minute] = event.target.value.split(":");
                          let toReturn = new Date(prevState);
                          toReturn.setHours(
                            parseInt(hour),
                            parseInt(minute),
                            0,
                            0
                          );
                          return toReturn;
                        });
                      }}
                    ></input>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, marginTop: 1 }}>
                    <Typography whiteSpace={"nowrap"}>Every:</Typography>
                    <TextField
                      value={recurringFrequency}
                      variant="standard"
                      onChange={frequencyFieldOnChange}
                    />
                    <Typography whiteSpace={"nowrap"}>Minutes</Typography>
                  </Box>
                </Box>
              </FormControl>
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
