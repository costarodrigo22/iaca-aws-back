import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "../../libs/sesClient";
import { getOrderReceivedEmailHtml } from "../../utils/getOrderReceivedEmailHtml";
import { bodyParser } from "../../utils/bodyParser";

export async function handler(event: any) {
  const body = bodyParser(event.body);

  try {
    const sendEmailCommand = new SendEmailCommand({
      Source: "contato@iacapuro.com.br",
      Destination: {
        ToAddresses: [body.email],
      },
      Message: {
        Subject: {
          Charset: "UTF-8",
          Data: "Pedido recebido",
        },
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: `Olá ${body.name}, recebemos o seu pedido. Você receberá um e-mail de confirmação com os detalhes do acompanhamento do pedido`,
          },
          Html: {
            Charset: "UTF-8",
            Data: getOrderReceivedEmailHtml(body.name),
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
}
