import Box from "@mui/material/Box";
import DropDownMenu from "./DropDownMenu";
import BreadCrumbs from "./BreadCrumbs";
import { fieldData } from "@/pages/home/[[...fieldPath]]";
import { Dispatch, SetStateAction } from "react";

export default function Header(props: {setFieldData: Dispatch<SetStateAction<fieldData | undefined>>}) {
  return (
    <Box>
      <Box
        sx={{
          backgroundColor: "grey",
          width: "100%",
          display: "flex",
          justifyContent: "right",
        }}
      >
        <DropDownMenu />
      </Box>
      <Box>
        <BreadCrumbs setFieldData={props.setFieldData}/>
      </Box>
    </Box>
  );
}
