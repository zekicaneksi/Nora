import * as React from "react";

import { IUserContext, UserContext } from "@/context/User";
import { useContext } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import { useRouter } from "next/navigation";
import { backendGET } from "@/utils/backendFetch";
import {
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

interface Log {
  date: number;
  text: string;
}

export default function DropDownMenu() {
  const user = useContext(UserContext) as IUserContext;
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [logData, setLogData] = React.useState<Log[]>();
  const [logPage, setLogPage] = React.useState<number>(0);

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

  const handleLogout = () => {
    backendGET("/signout", (response) => {
      if (response.status === 200) {
        router.push("/sign");
      }
    });
  };

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus();
    }

    prevOpen.current = open;
  }, [open]);

  React.useEffect(() => {
    if (isDialogOpen !== true) return;
    backendGET("/getLogs?page=" + logPage, async (response) => {
      setLogData((await response.json()).logs.reverse());
    });
  }, [isDialogOpen, logPage]);

  return (
    <>
      <Dialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
        }}
        fullWidth={true}
      >
        <Card sx={{ overflow: "auto" }}>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "20px",
            }}
          >
            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logData === undefined ? (
                    <TableRow>
                      <TableCell>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : (
                    logData?.map((log, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {new Date(log.date).toLocaleString()}
                        </TableCell>
                        <TableCell>{log.text}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <IconButton
                onClick={() => {
                  setLogPage((prev) => {
                    if (prev !== 0) return prev - 1;
                    else return prev;
                  });
                }}
              >
                <ArrowBackIosIcon
                  sx={
                    logData?.length && logData.length < 6
                      ? { opacity: 0.5 }
                      : {}
                  }
                />
              </IconButton>
              <IconButton
                onClick={() => {
                  setLogPage((prev) => {
                    if (logData?.at(-1)?.text === "signed up") return prev;
                    else return prev + 1;
                  });
                }}
              >
                <ArrowForwardIosIcon
                  sx={
                    logData?.at(-1)?.text === "signed up"
                      ? { opacity: 0.5 }
                      : {}
                  }
                />
              </IconButton>
            </Box>
            <Button
              variant="contained"
              onClick={() => {
                setIsDialogOpen(false);
              }}
            >
              OK
            </Button>
          </CardContent>
        </Card>
      </Dialog>
      <Box>
        <Button
          ref={anchorRef}
          id="composition-button"
          onClick={handleToggle}
          sx={{ color: "black", border: "2px solid", textTransform: "none" }}
        >
          {user.username}
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
                    <MenuItem
                      onClick={(e) => {
                        handleClose(e);
                        setIsDialogOpen(true);
                      }}
                    >
                      View Logs
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
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
