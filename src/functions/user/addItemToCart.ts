import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { response } from "../../utils/response";
import { bodyParser } from "../../utils/bodyParser";
import { v4 as uuidv4 } from "uuid";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "../../libs/dynamoClient";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;
  const body = bodyParser(event.body);
  const itemId = uuidv4();

  try {
    const pk = `ACCOUNT#${userId}`;
    const sk = `CART#${body.product_code}`;

    const putItemParams = {
      TableName: "AccountsTable",
      Item: {
        PK: pk,
        SK: sk,
        type: "cart",
        id: itemId,
        product_name: body.product_name,
        product_quantity: body.product_quantity,
        product_price: body.product_price,
        product_code: body.product_code,
        product_url_image: body.product_url_image,
      },
    };

    const commandPutItem = new PutCommand(putItemParams);

    const { Attributes } = await dynamoClient.send(commandPutItem);

    return response(201, {
      message: "Item add successfully.",
      itemCart: Attributes,
    });
  } catch (error) {
    return response(500, { error });
  }
}
