import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { CartRepository } from "../../repositories/cartRepository";
import { response } from "../../utils/response";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;

  const productCode = event.pathParameters?.productCode;

  if (!productCode) {
    return response(400, {
      message: "Código do produto é obrigatório.",
    });
  }

  const repository = new CartRepository();

  try {
    const result = await repository.deleteCartItem(userId, productCode);

    return response(200, result);
  } catch (error) {
    return response(500, {
      message: "Erro ao deletar o item do carrinho.",
      error: error.message,
    });
  }
}
