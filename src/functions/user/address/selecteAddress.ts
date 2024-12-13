import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { bodyParser } from "../../../utils/bodyParser";
import { response } from "../../../utils/response";
import { addressRepository } from "../../../repositories/addressRepository";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;
  const { addressId } = bodyParser(event.body);

  if (!addressId) {
    return response(400, { message: "Endereço é obrigatório." });
  }

  const repository = new addressRepository();

  try {
    await repository.deselectAllAddresses(userId);

    const result = await repository.selectAddress(userId, addressId);

    return response(200, {
      message: "Endereço selecionado com sucesso.",
      item: result,
    });
  } catch (error) {
    return response(500, {
      message: "Erro ao selecionar o endereço.",
      error,
    });
  }
}
