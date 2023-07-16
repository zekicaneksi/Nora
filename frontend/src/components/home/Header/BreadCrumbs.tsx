import Link from "next/link";
import { useRouter } from "next/router";

import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import AddButton from "./AddButton";
import { fieldData } from "@/pages/home/[[...fieldPath]]";
import { Dispatch, SetStateAction } from "react";
import { useTheme } from "@mui/material/styles";

export default function BreadCrumbs(props: {
  setFieldData: Dispatch<SetStateAction<fieldData | undefined>>;
}) {
  const router = useRouter();
  const theme = useTheme()

  const typographyColor = theme.palette.primary.main;
  const linkColor = theme.palette.secondary.main;

  return (
    <Box
      sx={{
        width: "100%",
        background: theme.palette.background.default,
        display: "flex",
      }}
    >
      <Breadcrumbs
        separator={<Typography variant="h5">›</Typography>}
        sx={{ marginLeft: "auto" }}
      >
        {router.query.fieldPath ? (
          <Link href={"/home"} style={{ textDecoration: "none" }}>
            <Typography color={linkColor} variant="h5">
              Home
            </Typography>
          </Link>
        ) : (
          <Typography color={typographyColor} variant="h5">
            Home
          </Typography>
        )}
        {Array.isArray(router.query.fieldPath) &&
          router.query.fieldPath?.map((elem, index) => {
            if (index === router.query.fieldPath!.length - 1) {
              return (
                <Typography key={index} color={typographyColor} variant="h5">
                  {elem.replace(/-/g, " ")}
                </Typography>
              );
            } else {
              const slice = router.query.fieldPath?.slice(0, index + 1);
              const href = Array.isArray(slice) ? slice?.join("/") : "";
              return (
                <Link
                  key={index}
                  href={"/home/" + href}
                  style={{ textDecoration: "none" }}
                >
                  <Typography color={linkColor} variant="h5">
                    {elem.replace(/-/g, " ")}
                  </Typography>
                </Link>
              );
            }
          })}
      </Breadcrumbs>
      <AddButton setFieldData={props.setFieldData} />
    </Box>
  );
}
