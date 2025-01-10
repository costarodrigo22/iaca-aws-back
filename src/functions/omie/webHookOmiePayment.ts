import { APIGatewayProxyEventV2 } from "aws-lambda";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "../../libs/sqsClient";
import { response } from "../../utils/response";

export async function handler(event: APIGatewayProxyEventV2) {
  const orderId = event.pathParameters?.orderId;
  const userId = event.pathParameters?.userId;
  const email = event.pathParameters?.email;
  const userName = event.pathParameters?.userName;
  const codeOrder = event.pathParameters?.codeOrder;

  try {
    const command = new SendMessageCommand({
      MessageBody: JSON.stringify({
        orderId,
        userId,
        email,
        userName,
        codeOrder,
      }),
      QueueUrl: process.env.QUEUE_URL,
    });

    await sqsClient.send(command);

    console.log(
      `mensagem adicionada a fila: ${JSON.stringify({
        orderId,
        userId,
        email,
        userName,
        codeOrder,
      })}`
    );

    return response(201, { message: "Compra adicionada a fila!!" });
  } catch (error) {
    console.log(`deu zica no webHook: ${error}`);

    return response(400, {
      message: "Algo deu errado ao adicionar o pedido a fila.",
    });
  }
}
