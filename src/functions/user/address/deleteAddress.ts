import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { CartRepository } from "../../../repositories/cartRepository";
import { response } from "../../../utils/response";
import { addressRepository } from "../../../repositories/addressRepository";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;

  const addressId = event.pathParameters?.addressId;

  const repository = new addressRepository();

  if (!addressId) {
    return response(400, {
      message: "Endereço é obrigatório.",
    });
  }

  try {
    const result = await repository.deleteAddress(userId, addressId);

    return response(200, result);
  } catch (error) {
    return response(500, {
      message: "Erro ao deletar o endereço.",
      error: error.message,
    });
  }
}
