import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { ordersRepository } from "../../../repositories/ordersRepositoy";
import { response } from "../../../utils/response";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;

  const orderId = event.pathParameters?.orderId;

  if (!userId || !orderId) {
    return response(400, {
      message: "orderId is required in the path parameters.",
    });
  }

  const repository = new ordersRepository();

  try {
    const result = await repository.getOrderById(userId, orderId);

    return response(200, {
      item: result,
    });
  } catch (error) {
    return response(500, {
      message: "Erro ao buscar o pedido.",
      error,
    });
  }
}
