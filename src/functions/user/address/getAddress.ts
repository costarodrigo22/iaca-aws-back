import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { bodyParser } from "../../../utils/bodyParser";
import {
  addressRepository,
  IAddress,
} from "../../../repositories/addressRepository";
import { response } from "../../../utils/response";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;

  const repository = new addressRepository();

  try {
    const result = await repository.getAddress(userId);

    return response(200, {
      item: result,
    });
  } catch (error) {
    return response(500, {
      message: "Erro ao buscar os endereços",
      error,
    });
  }
}
