import Header from "@/components/home/Header";
import {
  Grid,
} from "@mui/material";
import User from "@/context/User";
import { useEffect, useState } from "react";
import { backendGET } from "@/utils/backendFetch";
import { useRouter } from "next/router";
import FieldBox from "@/components/home/FieldBox";
import TodoBox from "@/components/home/TodoBox";

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
      <Header setFieldData={setFieldData} />
      <Grid container spacing={3} padding={3}>
        {fieldData?.fields.map((elem: field) => {
          return (
            <Grid item key={elem.path}>
              <FieldBox field={elem}/>
            </Grid>
          );
        })}
        {fieldData?.todoBoxes.map((elem: todoBox) => {
          return (
            <Grid item key={elem._id} xs={12} sm={6} md={4} lg={3}>
              <TodoBox fieldPath={fieldData.path} todoBox={elem} />
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
