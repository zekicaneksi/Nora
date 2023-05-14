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

export default function DropDownMenu() {
  const user = useContext(UserContext) as IUserContext;
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);

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

  return (
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
        sx={{zIndex: 1}}
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
                  <MenuItem onClick={handleClose}>Item1</MenuItem>
                  <MenuItem onClick={handleClose}>Item2</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  );
}
