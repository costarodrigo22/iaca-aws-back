import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { addressRepository } from "../../../repositories/addressRepository";
import { response } from "../../../utils/response";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;

  const repository = new addressRepository();

  try {
    const selectedAddress = await repository.getSelectedAddress(userId);

    if (!selectedAddress) {
      return response(404, {
        message: "Nenhum endereço selecionado encontrado.",
      });
    }

    return response(200, {
      item: selectedAddress,
    });
  } catch (error) {
    return response(500, {
      message: "Erro ao buscar o endereço selecionado.",
      error,
    });
  }
}
