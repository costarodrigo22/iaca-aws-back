import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { bodyParser } from "../../utils/bodyParser";
import { response } from "../../utils/response";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { CartRepository } from "../../repositories/cartRepository";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;
  const { product_quantity, product_code } = bodyParser(event.body);

  if (!product_quantity) {
    return response(400, {
      message: "Quantidade é obrigatória.",
    });
  }

  if (!product_code) {
    return response(400, {
      message: "Código do produto é obrigatório.",
    });
  }

  const repository = new CartRepository();

  try {
    const result = await repository.updateItemQuantity(
      userId,
      product_code,
      product_quantity
    );

    return response(200, {
      message: "Quantidade atualizada.",
      item: result.item,
    });
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      return response(404, {
        message: "Produto não encontrado no carrinho.",
      });
    }

    return response(500, { message: "Internal server error", error });
  }
}
