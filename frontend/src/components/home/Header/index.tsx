import Box from "@mui/material/Box";
import DropDownMenu from "./DropDownMenu";
import BreadCrumbs from "./BreadCrumbs";

export default function Header() {
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
      <BreadCrumbs />
    </Box>
  );
}
