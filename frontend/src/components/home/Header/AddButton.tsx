import * as React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Dialog from "@mui/material/Dialog";
import {
  Card,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { backendPOST } from "@/utils/backendFetch";
import { useRouter } from "next/router";
import { fieldData } from "@/pages/home/[[...fieldPath]]";

export default function AddButton(props: {
  setFieldData: React.Dispatch<React.SetStateAction<fieldData | undefined>>;
}) {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);

  const router = useRouter();

  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [dialogValue, setDialogValue] = React.useState<string>("");
  const [dialogInfo, setDialogInfo] = React.useState<string>("");
  const [dialogFor, setDialogFor] = React.useState<"todo" | "field">("field");
  const [dialogLoading, setDialogLoading] = React.useState<boolean>(false);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus();
    }

    prevOpen.current = open;
  }, [open]);

  function handleAddFieldBox() {
    setDialogFor("field");
    setDialogOpen(true);
    setOpen(false);
  }

  function handleAddTodoBox() {
    setDialogFor("todo");
    setDialogOpen(true);
    setOpen(false);
  }

  async function addTodoBox() {
    console.log("adding todo box:" + dialogValue);
  }

  async function addFieldBox() {
    let toReturn = "success";

    let path = "/home";
    if (router.query?.fieldPath && Array.isArray(router.query.fieldPath))
      path += "/" + router.query.fieldPath.join("/");
    const label = dialogValue.replace(/ /g, "-");
    await backendPOST(
      "/addField",
      { fieldPath: path, label: label },
      async (response) => {
        if (response.status === 400) {
          const err = await response.text();
          if (err === "exists") toReturn = "exists";
        } else if (response.status === 200) {
          props.setFieldData((old: any) => {
            const toReturn = { ...old };
            toReturn.fields?.push({ label: label, path: path + '/' + label });
            return toReturn;
          });
        }
      }
    );
    return toReturn;
  }

  async function handleDialogBtn() {
    if (dialogValue === "") {
      setDialogInfo("Please don't leave it empty");
      return;
    } else if (dialogValue.match(/^[a-zA-Z0-9 ]+$/) === null) {
      setDialogInfo("Please don't use special characters other than space");
      return;
    }

    setDialogLoading(true);
    if (dialogFor === "field") {
      const result = await addFieldBox();
      setDialogLoading(false);
      if (result === "exists") {
        setDialogInfo("Field already exists");
        return;
      }
    } else {
      await addTodoBox();
    }

    setDialogOpen(false);
    setDialogValue("");
  }

  React.useEffect(() => {
    setDialogInfo("");
  }, [dialogValue]);

  return (
    <>
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setDialogValue("");
          setDialogInfo("");
        }}
      >
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Label"
                  fullWidth={true}
                  value={dialogValue}
                  autoComplete="off"
                  onChange={(event) => {
                    setDialogValue(event.target.value);
                  }}
                />
              </Grid>
              {dialogInfo !== "" && (
                <Grid item xs={12}>
                  <Typography
                    color={"#d32f2f"}
                    variant="body1"
                    textAlign={"center"}
                  >
                    {dialogInfo}
                  </Typography>
                </Grid>
              )}
              {dialogLoading === true && (
                <Grid item xs={12} sx={{ textAlign: "center" }}>
                  <CircularProgress />
                </Grid>
              )}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  fullWidth={true}
                  onClick={handleDialogBtn}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Dialog>
      <Box sx={{ marginLeft: "auto" }}>
        <Button
          ref={anchorRef}
          id="composition-button"
          onClick={handleToggle}
          sx={{ color: "black", border: "2px solid", textTransform: "none" }}
        >
          +
        </Button>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          placement="bottom-start"
          transition
          disablePortal
          sx={{ zIndex: 1 }}
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === "bottom-start" ? "left top" : "left bottom",
              }}
            >
              <Paper sx={{ backgroundColor: "grey", borderRadius: "0" }}>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList autoFocusItem={open} id="composition-menu">
                    <MenuItem onClick={handleAddFieldBox}>Field Box</MenuItem>
                    <MenuItem onClick={handleAddTodoBox}>Todo Box</MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </Box>
    </>
  );
}
