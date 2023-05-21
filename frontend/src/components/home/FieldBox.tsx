import { Card, CardContent, Typography, keyframes } from "@mui/material";
import { useRouter } from "next/router";

import { field } from "@/pages/home/[[...fieldPath]]";

export default function FieldBox(props: { field: field }) {
  const router = useRouter();

  const { field } = props;

  const mustAttendBackground = keyframes`
  to {
    background-color: white;
  }
  to {
    background-color: #c03939;
  }
`;

  return (
    <Card
      onClick={() => {
        router.push(field.path);
      }}
      sx={{
        "&:hover": {
          border: "1px solid #00FF00",
          backgroundColor: "lightblue",
          cursor: "pointer",
        },
      }}
    >
      <CardContent
        sx={{
          ...(field.mustAttend && {
            animation: `${mustAttendBackground} 1s infinite alternate`,
          }),
        }}
      >
        <Typography>{field.label.replace(/-/g, " ")}</Typography>
      </CardContent>
    </Card>
  );
}
