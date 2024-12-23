import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { response } from "../../utils/response";
import { bodyParser } from "../../utils/bodyParser";
import { CartRepository, IProduct } from "../../repositories/cartRepository";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;
  const body = bodyParser(event.body);

  const repository = new CartRepository();

  try {
    const result = await repository.addItemToCart(userId, body as IProduct);

    if (!result.success) {
      return response(409, { message: result.message });
    }

    return response(201, {
      message: "Item adicionado ao carrinho com sucesso.",
      item: result.item,
    });
  } catch (error) {
    return response(500, {
      message: "Erro ao adicionar item ao carrinho.",
      error,
    });
  }
}
