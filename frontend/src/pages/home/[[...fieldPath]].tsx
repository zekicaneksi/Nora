import Header from "@/components/home/Header";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  Divider,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import User from "@/context/User";
import { useEffect, useState } from "react";
import { backendGET, backendPOST } from "@/utils/backendFetch";
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
    recurring: {
      isRecurring: boolean;
      startDate: number;
      frequency: number;
      lastCheck: number;
    };
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
  closestRecurring: number;
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

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [dialogLoading, setDialogLoading] = useState<boolean>(false);

  const isScreenBelowMedium = useMediaQuery(theme.breakpoints.down("md"));

  const [time, setTime] = useState(Date.now()); // Rerender every now and then to refresh recurrings

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 10000);
    return () => {
      clearInterval(interval);
    };
  }, []);

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

  function removeTodoBox(id: string) {
    setFieldData((prev: any) => {
      let toReturn = { ...prev };
      const index = toReturn.todoBoxes?.findIndex(
        (todoBox: todoBox) => todoBox._id === id
      );
      if (index !== undefined && index > -1) {
        toReturn.todoBoxes?.splice(index, 1);
      }
      return toReturn;
    });
  }

  function onDialogClose(remove: boolean) {
    if (!remove) {
      setIsDialogOpen(false);
      return;
    } else {
      backendPOST(
        "/removeField",
        { path: fieldData?.path },
        async (response) => {
          if (response.status === 200) {
            setDialogLoading(false);
            setIsDialogOpen(false);
            const navPath = fieldData?.path.substring(0,fieldData?.path.lastIndexOf('/')) || '/home'
            router.push(navPath)
          }
        }
      );
    }
  }

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

  const isFieldEmpty =
    fieldData !== undefined &&
    fieldData?.fields.length === 0 &&
    fieldData.todoBoxes.length === 0
      ? true
      : false;

  if (isFieldEmpty)
    return (
      <>
        <Dialog
          open={isDialogOpen}
          onClose={() => {
            onDialogClose(false);
          }}
          fullWidth={true}
        >
          <Card>
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "20px",
              }}
            >
              <Typography
                textAlign={"center"}
                marginBottom={"2rem"}
                marginTop={"2rem"}
              >
                Are sure you want to remove this field?
              </Typography>
              {dialogLoading && (
                <CircularProgress sx={{ alignSelf: "center" }} />
              )}
              <Box sx={{ display: "flex", flexDirection: "row", gap: "2rem" }}>
                <Button
                  variant="contained"
                  fullWidth={true}
                  onClick={() => {
                    onDialogClose(true);
                    setDialogLoading(true);
                  }}
                >
                  Yes
                </Button>
                <Button
                  variant="contained"
                  fullWidth={true}
                  onClick={() => {
                    onDialogClose(false);
                  }}
                >
                  No
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Dialog>

        <Header setFieldData={setFieldData} />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
            alignItems: "center",
            flex: 1,
            backgroundColor: theme.palette.background.default
          }}
        >
          <Typography variant={"h3"}>Field is empty</Typography>
          <Typography>
            {"You can add a TodoBox or a Field from the top right '+' button."}
          </Typography>
          {fieldData?.path !== "/home" && (
            <Button
              variant="contained"
              onClick={() => {
                setIsDialogOpen(true);
              }}
            >
              Delete field
            </Button>
          )}
        </Box>
      </>
    );
  else
    return (
      <>
        <Header setFieldData={setFieldData} />
        <Box
          sx={{
            display: "flex",
            flexDirection: isScreenBelowMedium ? "column" : "row",
            backgroundColor: theme.palette.background.default,
            flex: 1
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
            sx={{
              margin: 2,
              ...(isScreenBelowMedium ? {} : { marginRight: 0 }),
            }}
          />
          <Grid container sx={{ padding: 2 }} spacing={3}>
            {fieldData?.todoBoxes.map((elem: todoBox) => {
              return (
                <Grid item key={elem._id} xs={12} sm={6} md={4} lg={3}>
                  <TodoBox
                    fieldPath={fieldData.path}
                    todoBox={elem}
                    onRemove={removeTodoBox}
                  />
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
