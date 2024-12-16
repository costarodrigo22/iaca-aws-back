import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { response } from "../../../utils/response";
import { addressRepository } from "../../../repositories/addressRepository";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;

  const repository = new addressRepository();

  try {
    await repository.deselectAllAddresses(userId);

    return response(200, {
      message: "Endereço desmarcado com sucesso.",
    });
  } catch (error) {
    return response(500, {
      message: "Erro ao selecionar o endereço.",
      error,
    });
  }
}
