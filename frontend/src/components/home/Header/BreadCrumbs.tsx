import Link from "next/link";
import { useRouter } from "next/router";

import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function BreadCrumbs() {
  const router = useRouter();

  const typographyColor = "black";
  const linkColor = "#b0acac";

  return (
    <Box
      sx={{
        width: "100%",
        background: "#5b5959",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Breadcrumbs separator={<Typography variant="h5">›</Typography>}>
        {router.query.fieldPath ? (
          <Link href={"/home"} style={{textDecoration: 'none'}}>
            <Typography color={linkColor} variant="h5">Home</Typography>
          </Link>
        ) : (
          <Typography color={typographyColor} variant="h5">Home</Typography>
        )}
        {Array.isArray(router.query.fieldPath) &&
          router.query.fieldPath?.map((elem, index) => {
            if (index === router.query.fieldPath!.length - 1) {
              return (
                <Typography key={index} color={typographyColor} variant="h5">
                  {elem}
                </Typography>
              );
            } else {
              const slice = router.query.fieldPath?.slice(0, index + 1);
              const href = Array.isArray(slice) ? slice?.join("/") : "";
              return (
                <Link key={index} href={"/home/" + href} style={{textDecoration: 'none'}}>
                  <Typography color={linkColor} variant="h5">{elem}</Typography>
                </Link>
              );
            }
          })}
      </Breadcrumbs>
    </Box>
  );
}
