import { todoItem } from "@/pages/home/[[...fieldPath]]";
import { Box, Typography, keyframes } from "@mui/material";
import { useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RemoveDialog from "./Dialogs/RemoveDialog";
import ContentDialog from "./Dialogs/ContentDialog";
import OptionsDialog from "./Dialogs/OptionsDialog";
import { backendPOST } from "@/utils/backendFetch";

export default function TodoItem(props: {
  todoItem: todoItem;
  setTodoItem: (remove: boolean, item: todoItem) => void;
  recurringCount: number;
}) {
  const { todoItem, setTodoItem, recurringCount } = props;

  const [loading, setLoading] = useState<boolean>(false);

  const [openDialog, setOpenDialog] = useState<
    "" | "settings" | "remove" | "content"
  >("");

  const iconSx = {
    "&:hover": {
      color: "grey",
    },
  };

  function handleItemClick(event: React.MouseEvent) {
    setOpenDialog("content");
  }

  function handleSettingsClick(event: React.MouseEvent<SVGSVGElement>) {
    event.stopPropagation();
    setOpenDialog("settings");
  }

  function handleRemoveClick(event: React.MouseEvent<SVGSVGElement>) {
    event.stopPropagation();
    setOpenDialog("remove");
  }

  function handleRecurringClick(event: React.MouseEvent<SVGSVGElement>) {
    event.stopPropagation();

    setLoading(true);

    let toSet = { ...todoItem };
    const lastCheck = toSet.options.recurring.lastCheck;
    toSet.options.recurring.lastCheck =
      lastCheck === 0
        ? todoItem.options.recurring.startDate +
          todoItem.options.recurring.frequency * 60000
        : todoItem.options.recurring.lastCheck +
          todoItem.options.recurring.frequency * 60000;

    backendPOST(
      "/changeTodoItemLastCheck",
      {
        todoId: todoItem._id,
        lastCheckValue: toSet.options.recurring.lastCheck,
      },
      (response) => {
        if (response.status === 200) {
          setTodoItem(false, {
            ...toSet,
          });
          setLoading(false);
        }
      }
    );
  }

  async function handleOptionsDialogClose(
    apply: boolean,
    values?: {
      todoItemId: string;
      labelValue: string;
      mustAttendValue: boolean;
      recurringValue: {
        isRecurring: boolean;
        startDate: number;
        frequency: number;
        lastCheck: number;
      };
    }
  ) {
    if (apply && values) {
      await backendPOST(
        "/changeTodoItemOptions",
        {
          todoId: values.todoItemId,
          labelValue: values.labelValue,
          mustAttendValue: values.mustAttendValue,
          recurringValue: values.recurringValue,
        },
        (response) => {
          if (response.status === 200) {
            setTodoItem(false, {
              ...todoItem,
              label: values.labelValue,
              options: {
                mustBeAttended: values.mustAttendValue,
                recurring: values.recurringValue,
              },
            });
            setOpenDialog("");
          }
        }
      );
      setOpenDialog("");
    } else setOpenDialog("");
  }

  async function handleContentDialogClose(apply: boolean, value?: string) {
    if (apply) {
      await backendPOST(
        "/changeTodoItemContent",
        { todoId: todoItem._id, content: value },
        (response) => {
          if (response.status === 200) {
            setTodoItem(false, { ...todoItem, content: value });
            setOpenDialog("");
          }
        }
      );
    } else setOpenDialog("");
  }

  async function handleRemoveDialogClose(remove: boolean) {
    if (remove) {
      await backendPOST(
        "/removeTodoItem",
        { todoId: todoItem._id },
        (response) => {
          if (response.status === 200) {
            setTodoItem(true, todoItem);
            setOpenDialog("");
          }
        }
      );
    } else {
      setOpenDialog("");
    }
  }

  let dialogContent;
  if (openDialog === "settings") {
    dialogContent = (
      <OptionsDialog todoItem={todoItem} onClose={handleOptionsDialogClose} />
    );
  } else if (openDialog === "remove") {
    dialogContent = (
      <RemoveDialog todoItem={todoItem} onClose={handleRemoveDialogClose} />
    );
  } else if (openDialog === "content") {
    dialogContent = (
      <ContentDialog todoItem={todoItem} onClose={handleContentDialogClose} />
    );
  }

  const mustAttendBackground = keyframes`
  to {
    background-color: white;
  }
  to {
    background-color: #c03939;
  }
`;

  return (
    <>
      {dialogContent}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          border: "1px solid grey",
          padding: "3px",
          marginTop: "2px",
          marginBottom: "2px",
          borderRadius: "2.5px",
          ...(recurringCount === 0 ? { opacity: 0.5 } : {}),
          ...(todoItem.options.mustBeAttended &&
            (recurringCount > 0 || recurringCount === -1) && {
              animation: `${mustAttendBackground} 1s infinite alternate`,
            }),
          "&:hover": {
            cursor: "pointer",
            backgroundColor: "lightblue",
          },
          ...(loading
            ? {
                opacity: 0.5,
                "&:hover": {
                  cursor: "not-allowed",
                },
              }
            : {}),
        }}
        onClick={handleItemClick}
      >
        <Typography>
          {recurringCount !== -1 ? "(" + recurringCount + ") " : ""}
          {todoItem.label}
        </Typography>
        <Box sx={{ display: "flex" }}>
          {recurringCount > 0 && (
            <CheckCircleOutlineIcon
              sx={iconSx}
              onClick={handleRecurringClick}
            />
          )}
          <SettingsIcon sx={iconSx} onClick={handleSettingsClick} />
          <RemoveCircleOutlineIcon sx={iconSx} onClick={handleRemoveClick} />
        </Box>
      </Box>
    </>
  );
}
