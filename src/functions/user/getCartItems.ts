import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { CartRepository } from "../../repositories/cartRepository";
import { response } from "../../utils/response";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;

  const repository = new CartRepository();

  try {
    const result = await repository.getCartItems(userId);

    return response(200, {
      item: result,
    });
  } catch (error) {
    return response(500, {
      message: "Erro ao listar os itens do carrinho.",
      error,
    });
  }
}
