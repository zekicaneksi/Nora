import { Card, CardContent, Typography, keyframes, useTheme } from "@mui/material";
import { useRouter } from "next/router";

import { field } from "@/pages/home/[[...fieldPath]]";

export default function FieldBox(props: { field: field }) {
  const router = useRouter();
  const theme = useTheme()

  const { field } = props;

  const mustAttendBackground = keyframes`
  to {
    background-color: ${theme.palette.background.glow};
  }
`;

  return (
    <Card
      onClick={() => {
        router.push(field.path);
      }}
      sx={{
        overflow: "visible",
        "&:hover": {
          backgroundColor: "lightblue",
          cursor: "pointer",
        },
      }}
    >
      <CardContent
        sx={{
          ...(field.closestRecurring !== -1 &&
            field.closestRecurring <= Date.now() && {
              animation: `${mustAttendBackground} 1s infinite alternate`,
            }),
        }}
      >
        <Typography textAlign={"center"}>
          {field.label.replace(/-/g, " ")}
        </Typography>
      </CardContent>
    </Card>
  );
}
