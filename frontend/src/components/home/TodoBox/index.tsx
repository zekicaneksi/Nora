import { todoBox, todoItem } from "@/pages/home/[[...fieldPath]]";
import { backendPOST } from "@/utils/backendFetch";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
  Typography,
  keyframes,
} from "@mui/material";
import { useEffect, useState } from "react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import TodoItem from "./TodoItem";
import TodoBoxRemoveDialog from "./Dialogs/TodoBoxRemoveDialog";

export default function TodoBox(props: {
  fieldPath: string;
  todoBox: todoBox;
  onRemove: (id: string) => void;
}) {
  const { fieldPath, todoBox, onRemove } = props;

  const [addItemField, setAddItemField] = useState<string>("");
  const [errorInfo, setErrorInfo] = useState<string>("");
  const [todoItems, setTodoItems] = useState<todoItem[]>([]);

  const [addItemLoading, setAddItemLoading] = useState<boolean>(false);
  const [todoItemsLoading, setTodoItemsLoading] = useState<boolean>(true);

  const [isRemoveBoxDialogOpen, setIsRemoveBoxDialogOpen] =
    useState<boolean>(false);

  useEffect(() => {
    if (!todoItemsLoading) return;
    backendPOST(
      "/getTodoItems",
      { path: fieldPath, todoBoxId: todoBox._id },
      async (response) => {
        const res = await response.json();
        setTodoItems(res);
        setTodoItemsLoading(false);
      }
    );
  }, [fieldPath, todoBox, todoItemsLoading]);

  async function handleAddItem() {
    setAddItemField((prevState) => prevState.trim());

    if (addItemField.length === 0) {
      setErrorInfo("please do not leave empty");
      return;
    } else if (addItemField.match(/^[a-zA-Z0-9 /-]+$/) === null) {
      setErrorInfo("please do not use special characters");
      return;
    }

    setAddItemLoading(true);
    await backendPOST(
      "/addTodoItem",
      { fieldPath: fieldPath, todoBoxId: todoBox._id, label: addItemField },
      async (response) => {
        if (response.status === 200) {
          const res = await response.json();
          setTodoItems((prev) => [...prev, res]);
          setErrorInfo("");
          setAddItemField("");
        }
      }
    );
    setAddItemLoading(false);
  }

  function setTodoItem(remove: boolean, item: todoItem) {
    setTodoItems((prev) => {
      let toReturn = [...prev];
      const itemIndex = toReturn.findIndex((elem) => elem._id === item._id);
      if (remove) toReturn.splice(itemIndex, 1);
      else toReturn[itemIndex] = item;
      return toReturn;
    });
  }

  function calculateRecurringCount(todoItem: todoItem) {
    const { startDate, frequency, lastCheck } = todoItem.options.recurring;

    if (!todoItem.options.recurring.isRecurring) return -1;
    let localTime = Date.now();

    if (localTime < startDate) return 0;
    if (lastCheck === 0)
      return (
        (localTime - startDate) / 60000 / frequency + 1
      ); // +1 is for it to be inclusive with the start date
    else return (localTime - lastCheck) / 60000 / frequency;
  }

  function removeTodoBox(remove: boolean) {
    if (!remove) {
      setIsRemoveBoxDialogOpen(false);
      return;
    } else {
      backendPOST(
        "/removeTodoBox",
        { todoId: todoBox._id, fieldPath: fieldPath },
        async (response) => {
          if (response.status === 200) {
            onRemove(todoBox._id);
            setIsRemoveBoxDialogOpen(false);
          }
        }
      );
    }
  }

  const mustAttendBackground = keyframes`
  to {
    background-color: white;
  }
  to {
    background-color: grey;
  }
`;

  let isBoxMustAttended = false;

  let todoItemsList = todoItems?.map((item: todoItem) => {
    const result = calculateRecurringCount(item);
    const recurringCount = result > 0 ? Math.floor(result) : Math.ceil(result);
    if (
      item.options.mustBeAttended &&
      (recurringCount > 0 || recurringCount === -1)
    )
      isBoxMustAttended = true;
    return (
      <Grid item key={item._id} xs={12}>
        <TodoItem
          todoItem={item}
          setTodoItem={setTodoItem}
          recurringCount={recurringCount}
        />
      </Grid>
    );
  });

  return (
    <>
      {isRemoveBoxDialogOpen && <TodoBoxRemoveDialog onClose={removeTodoBox} />}
      <Card
        sx={{
          borderRadius: 0,
          ...(!isBoxMustAttended
            ? {}
            : {
                animation: `${mustAttendBackground} 1s infinite alternate`,
              }),
        }}
      >
        <CardContent>
          <Box
            sx={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Typography>{todoBox.label}</Typography>
            <RemoveCircleOutlineIcon
              sx={{
                position: "absolute",
                right: 0,
                "&:hover": {
                  color: "grey",
                  cursor: "pointer",
                },
              }}
              onClick={() => {
                setIsRemoveBoxDialogOpen(true);
              }}
            />
          </Box>
          <CardContent>
            {todoItemsLoading ? (
              <CircularProgress
                sx={{
                  position: "relative",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                }}
              />
            ) : (
              <Grid container>{todoItemsList}</Grid>
            )}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "15px",
              }}
            >
              <TextField
                placeholder="add new item"
                variant="standard"
                autoComplete="off"
                value={addItemField}
                onChange={(event) => {
                  setAddItemField(event.target.value);
                }}
                disabled={addItemLoading ? true : false}
              />
              <AddCircleOutlineIcon
                sx={{
                  color: addItemLoading ? "grey" : "black",
                  "&:hover": addItemLoading
                    ? {}
                    : {
                        color: "lightblue",
                        cursor: "pointer",
                      },
                }}
                onClick={handleAddItem}
              />
            </Box>
            {errorInfo !== "" && (
              <Typography color={"#d32f2f"} variant="body2">
                {errorInfo}
              </Typography>
            )}
          </CardContent>
        </CardContent>
      </Card>
    </>
  );
}
