export async function backendGET(
  route: string,
  callback: (response: Response) => void
) {
  const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_ADDRESS + route, {
    credentials: 'include'
  });
  callback(response);
}

export async function backendPOST(
  route: string,
  data: {},
  callback: (response: Response) => void
) {
  const response = await fetch(
    process.env.NEXT_PUBLIC_BACKEND_ADDRESS + route,
    {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
  callback(response);
}
