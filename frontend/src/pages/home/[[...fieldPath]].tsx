import Header from "@/components/home/Header";
import { Typography, Grid, CardContent, Card } from "@mui/material";
import User from "@/context/User";
import { useEffect, useState } from "react";
import { backendGET } from "@/utils/backendFetch";
import { useRouter } from "next/router";

export interface field {
  label: string;
  path: string;
}

export interface fieldData {
  path: string;
  fields: field[];
  todoBoxes: string[];
}

function Page() {
  const router = useRouter();
  const [fieldData, setFieldData] = useState<fieldData>();

  useEffect(() => {
    if (!router.isReady) return;
    backendGET("/getField" + router.asPath, async (response) => {
      if (response.status === 200) {
        const data = await response.json();
        setFieldData(data);
      } else {
        if (router.asPath !== "/home") router.push("/home");
      }
    });
  }, [router]);

  return (
    <>
      <Header setFieldData={setFieldData}/>
      <Grid container spacing={3} padding={3}>
        {fieldData?.fields.map((elem: field) => {
          return (
            <Grid item key={elem.path}>
              <Card
                onClick={() => {
                  router.push(elem.path);
                }}
                sx={{
                  "&:hover": {
                    border: "1px solid #00FF00",
                    backgroundColor: "lightblue",
                    cursor: "pointer",
                  },
                }}
              >
                <CardContent>
                  <Typography>{elem.label.replace(/-/g,' ')}</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}

export default function Home() {
  return (
    <User>
      <Page />
    </User>
  );
}
