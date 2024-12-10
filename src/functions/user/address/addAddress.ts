import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { bodyParser } from "../../../utils/bodyParser";
import {
  addressRepository,
  IAddress,
} from "../../../repositories/addressRepository";
import { response } from "../../../utils/response";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;
  const body = bodyParser(event.body);

  const repository = new addressRepository();

  try {
    const result = await repository.addAddress(userId, body as IAddress);

    if (!result.success) {
      return response(409, { message: result.message });
    }

    return response(201, {
      message: "Endereço cadastrado com sucesso.",
      item: result.item,
    });
  } catch (error) {
    return response(500, {
      message: "Erro ao adicionar item ao carrinho.",
      error,
    });
  }
}
