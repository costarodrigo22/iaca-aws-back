export async function handler(event: any) {
  console.log("Callback recebido:", JSON.stringify(event, null, 2));

  return JSON.stringify(event, null, 2);
}
