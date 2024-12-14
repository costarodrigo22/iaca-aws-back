import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { ordersRepository } from "../../../repositories/ordersRepositoy";
import { response } from "../../../utils/response";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;

  const repository = new ordersRepository();

  try {
    const result = await repository.getOrders(userId);

    return response(200, {
      item: result,
    });
  } catch (error) {
    return response(500, {
      message: "Erro ao listar os pedidos.",
      error,
    });
  }
}
