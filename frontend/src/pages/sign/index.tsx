import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { backendPOST } from "@/utils/backendFetch";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

function InputComponent(props: {
  id: string;
  label: string;
  type: string;
  helperText: string;
  setHelperText: Dispatch<SetStateAction<string>>;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
}) {
  const { id, label, type, helperText, setHelperText, value, setValue } = props;

  useEffect(() => {
    setHelperText("");
  }, [value, setHelperText]);

  return (
    <TextField
      id={id}
      label={label}
      type={type}
      error={helperText === "" ? false : true}
      helperText={helperText}
      value={value}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
      }}
    />
  );
}

export default function Sign() {
  const router = useRouter();

  const [username, setUsername] = useState<string>("");
  const [usernameHelperText, setUsernameHelperText] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordHelperText, setPasswordHelperText] = useState<string>("");
  const [info, setInfo] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  function signUpOnClick() {
    const checkUsernameSpaces = username.indexOf(" ") !== -1;
    const checkPasswordSpaces = password.indexOf(" ") !== -1;
    const checkUsernameLength = username.length < 10;
    const checkPasswordLength = password.length < 10;

    if (
      checkUsernameLength ||
      checkPasswordLength ||
      checkUsernameSpaces ||
      checkPasswordSpaces
    ) {
      if (checkUsernameLength || checkUsernameSpaces) {
        if (checkUsernameLength) setUsernameHelperText("Minimum 10 length");
        else if (checkUsernameSpaces)
          setUsernameHelperText("Username can't contain spaces");
      }
      if (checkPasswordLength || checkPasswordSpaces) {
        if (checkPasswordLength) setPasswordHelperText("Minimum 10 length");
        else if (checkPasswordSpaces)
          setPasswordHelperText("Username can't contain spaces");
      }
    } else {
      setLoading(true);
      backendPOST(
        "/signup",
        { username: username, password: password },
        (response) => {
          setLoading(false);
          if (response.status === 401) setInfo("Username is in use");
          else {
            setInfo("");
            router.push("/");
          }
        }
      );
    }
  }

  function signInOnClick() {
    setLoading(true);
    backendPOST(
      "/signin",
      { username: username, password: password },
      async (response) => {
        setLoading(false);
        if (response.status === 401) {
          const err = await response.text();
          if (err === "username") setInfo("Username couldn't be found");
          else if (err === "password") setInfo("Password is incorrect");
        } else {
          setInfo("");
          router.push("/");
        }
      }
    );
  }

  return (
    <Box
      component="form"
      noValidate
      autoComplete="off"
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card>
        <CardContent
          sx={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <InputComponent
            id="username"
            label="Username"
            type="text"
            helperText={usernameHelperText}
            setHelperText={setUsernameHelperText}
            value={username}
            setValue={setUsername}
          />
          <InputComponent
            id="password"
            label="Password"
            type="password"
            helperText={passwordHelperText}
            setHelperText={setPasswordHelperText}
            value={password}
            setValue={setPassword}
          />
          {info !== "" && (
            <Typography color={"#d32f2f"} variant="body1" textAlign={"center"}>
              {info}
            </Typography>
          )}
          {loading && (
            <CircularProgress
              sx={{ marginRight: "auto", marginLeft: "auto" }}
            />
          )}
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                onClick={signUpOnClick}
                fullWidth={true}
              >
                Sign up
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                onClick={signInOnClick}
                fullWidth={true}
              >
                Sign in
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
