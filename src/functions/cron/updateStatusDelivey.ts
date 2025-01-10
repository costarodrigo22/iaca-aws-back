import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { dynamoClient } from "../../libs/dynamoClient";
import axios from "axios";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

export async function handler() {
  const params = {
    TableName: "AccountsTable",
    IndexName: "TypeIndex",
    KeyConditionExpression: "#type = :type",
    ExpressionAttributeNames: {
      "#type": "type",
    },
    ExpressionAttributeValues: {
      ":type": { S: "order" },
    },
  };

  try {
    const command = new QueryCommand(params);

    const { Items } = await dynamoClient.send(command);

    if (Items) {
      const promises = Items?.map(async (order) => {
        const orderCodeOmie = order?.order_code_omie?.N;
        const pk = order?.PK?.S;
        const sk = order?.SK?.S;

        if (orderCodeOmie) {
          const url = `https://admin.iacapuro.com.br/api/without/omie/consult_sale/${orderCodeOmie}`;

          try {
            const resultApiOmie = await axios.get(url);

            if (
              resultApiOmie.data.pedido_venda_produto.cabecalho.etapa === "70"
            ) {
              const updateParams = {
                TableName: "AccountsTable",
                Key: {
                  PK: pk,
                  SK: sk,
                },
                UpdateExpression: "SET orderStatus = :status",
                ExpressionAttributeValues: {
                  ":status": "Entregue",
                },
              };

              const command = new UpdateCommand(updateParams);

              await dynamoClient.send(command);

              console.log(
                `Status do pedido ${orderCodeOmie} atualizado para "entregue"`
              );
            } else {
              console.log(
                `Status do pedido ${orderCodeOmie} NÃO FOI atualizado para "entregue"`
              );
            }
          } catch (apiOmieError) {
            console.error(
              `Erro ao consultar a API para o pedido ${orderCodeOmie}:`,
              apiOmieError
            );
          }
        }
      });

      await Promise.all(promises);
    }
  } catch (error) {
    console.error("Erro ao consultar DynamoDB:", error);
  }
}
