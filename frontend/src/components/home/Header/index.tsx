import Box from "@mui/material/Box";
import DropDownMenu from "./DropDownMenu";
import BreadCrumbs from "./BreadCrumbs";
import { fieldData } from "@/pages/home/[[...fieldPath]]";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Typography, useTheme } from "@mui/material";
import { backendPOST } from "@/utils/backendFetch";

export default function Header(props: {
  setFieldData: Dispatch<SetStateAction<fieldData | undefined>>;
}) {
  const theme = useTheme();

  const [localTimeWarning, setLocalTimeWarning] = useState<boolean>(false);

  useEffect(() => {
    backendPOST("/checkUTCTime", { time: Date.now() }, (response) => {
      response.text().then((res) => {
        if (res === "BAD") setLocalTimeWarning(true);
      });
    });
  }, []);

  return (
    <Box>
      <Box
        sx={{
          backgroundColor: "grey",
          width: "100%",
          display: "flex",
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {localTimeWarning && (
            <Typography
              textAlign="center"
              color={theme.palette.warning.main}
              variant="h5"
            >
              FOR THE APP TO CALCULATE THE TIME CORRECTLY, PLEASE UPDATE YOUR
              LOCAL TIME!
            </Typography>
          )}
        </Box>

        <DropDownMenu />
      </Box>
      <Box>
        <BreadCrumbs setFieldData={props.setFieldData} />
      </Box>
    </Box>
  );
}
