import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "../../libs/sqsClient";
import { response } from "../../utils/response";

export async function handler(event: any) {
  const orderId = event.pathParameters?.orderId;
  const userId = event.pathParameters?.userId;

  console.log("Order ID:", orderId, "User ID:", userId);

  try {
    const command = new SendMessageCommand({
      MessageBody: JSON.stringify({ orderId, userId }),
      QueueUrl: process.env.QUEUE_URL,
    });

    await sqsClient.send(command);

    return response(201, { message: "Compra adicionada a fila!!" });
  } catch (error) {
    console.log("webHookOmiePayment error: ", error);

    return response(400, {
      message: "Algo deu errado ao adicionar o pedido a fila.",
    });
  }
}
