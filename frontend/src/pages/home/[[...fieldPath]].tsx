import Header from "@/components/home/Header";
import { Box, Divider, Grid, useMediaQuery, useTheme } from "@mui/material";
import User from "@/context/User";
import { useEffect, useState } from "react";
import { backendGET } from "@/utils/backendFetch";
import { useRouter } from "next/router";
import FieldBox from "@/components/home/FieldBox";
import TodoBox from "@/components/home/TodoBox";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

export interface todoItem {
  _id: string;
  label: string;
  options: {
    mustBeAttended: boolean;
    recurring: string;
  };
  content?: string;
}

export interface todoBox {
  _id: string;
  label: string;
  todoItems: todoItem[];
}

export interface field {
  label: string;
  path: string;
  mustAttend: boolean;
}

export interface fieldData {
  path: string;
  fields: field[];
  todoBoxes: todoBox[];
}

function Page() {
  const theme = useTheme();

  const router = useRouter();
  const [fieldData, setFieldData] = useState<fieldData>();

  const isScreenBelowMedium = useMediaQuery(theme.breakpoints.down("md"));

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

  const fields = (
    <Box
      sx={{
        display: "flex",
        flexDirection: isScreenBelowMedium ? "row" : "column",
        gap: 2,
        padding: 1,
      }}
    >
      {fieldData?.fields.map((elem: field) => {
        return <FieldBox key={elem.path} field={elem} />;
      })}
    </Box>
  );

  return (
    <>
      <Header setFieldData={setFieldData} />
      <Box
        sx={{
          display: "flex",
          flexDirection: isScreenBelowMedium ? "column" : "row",
        }}
      >
        <Box
          sx={{
            padding: 2,
            ...(isScreenBelowMedium ? {} : { paddingRight: 0 }),
          }}
        >
          {isScreenBelowMedium ? (
            <SimpleBar autoHide={false}>{fields}</SimpleBar>
          ) : (
            <>{fields}</>
          )}
        </Box>
        <Divider
          role="presentation"
          orientation={isScreenBelowMedium ? "horizontal" : "vertical"}
          flexItem
          sx={{ margin: 2, ...(isScreenBelowMedium ? {} : { marginRight: 0 }) }}
        />
        <Grid container sx={{ padding: 2 }} spacing={3}>
          {fieldData?.todoBoxes.map((elem: todoBox) => {
            return (
              <Grid item key={elem._id} xs={12} sm={6} md={4} lg={3}>
                <TodoBox fieldPath={fieldData.path} todoBox={elem} />
              </Grid>
            );
          })}
        </Grid>
      </Box>
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
