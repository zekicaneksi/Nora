import { backendGET } from "@/utils/backendFetch";
import { CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from "react";

export interface IUserContext {
  username: string;
  setUsername: Dispatch<SetStateAction<string>>;
}

export const UserContext = createContext<IUserContext | null>(null);

export default function User(props: { children: JSX.Element | JSX.Element[] }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");

  const { children } = props;

  const router = useRouter();

  useEffect(() => {
    backendGET("/getUserInfo", async (response) => {
      if (response.status === 403) router.push("/sign");
      else {
        let data = await response.json()
        setUsername(data.user.username);
      }
    });
  }, [router]);

  useEffect(() => {
    if (username !== "") setLoading(false);
  }, [username])

  if (loading) return <CircularProgress sx={{position: 'relative', top:'50%', left: '50%', transform: 'translate(-50%,-50%)'}}/>;
  else
    return (
      <UserContext.Provider value={{ username, setUsername }}>
        {children}
      </UserContext.Provider>
    );
}
