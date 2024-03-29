export async function backendGET(
  route: string,
  callback: (response: Response) => void
) {
  const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_ADDRESS + '/api' + route, {
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
    process.env.NEXT_PUBLIC_BACKEND_ADDRESS + '/api' +route,
    {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
  await callback(response);
}
