import { SQSEvent } from "aws-lambda";
import { ordersRepository } from "../../repositories/ordersRepositoy";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { getPurchaseApprovedEmailHtml } from "../../utils/getPurchaseApprovedEmailHtml";
import { sesClient } from "../../libs/sesClient";

export async function handler(event: SQSEvent) {
  const repositoty = new ordersRepository();

  const updatedItems = event.Records.map(async (record: any) => {
    try {
      const body = JSON.parse(record.body);

      await repositoty.updateOrder(
        body.orderId,
        body.userId,
        "Pagamento realizado"
      );

      const trackingUrl = `http://localhost:3000/TrackOrder/${body.orderId}/${body.codeOrder}`;

      const sendEmailCommand = new SendEmailCommand({
        Source: "contato@iacapuro.com.br",
        Destination: {
          ToAddresses: [body.email],
        },
        Message: {
          Subject: {
            Charset: "UTF-8",
            Data: "Compra aprovada",
          },
          Body: {
            Text: {
              Charset: "UTF-8",
              Data: "",
            },
            Html: {
              Charset: "UTF-8",
              Data: getPurchaseApprovedEmailHtml(body.userName, trackingUrl),
            },
          },
        },
      });

      await sesClient.send(sendEmailCommand);

      return {
        statusCode: 200,
      };
    } catch (error) {
      return { error };
    }
  });

  await Promise.all(updatedItems);
}
