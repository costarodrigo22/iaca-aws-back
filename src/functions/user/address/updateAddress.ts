import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { bodyParser } from "../../../utils/bodyParser";
import { response } from "../../../utils/response";
import { addressRepository } from "../../../repositories/addressRepository";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;

  const {
    cep,
    country,
    street,
    number,
    neighborhood,
    complement,
    city,
    state,
    uf,
    reference,
    id,
    selected,
    isDefault,
  } = bodyParser(event.body);

  if (!cep) {
    return response(400, {
      message: "CEP é obrigatório.",
    });
  }

  if (!uf) {
    return response(400, {
      message: "UF é obrigatório.",
    });
  }

  const repository = new addressRepository();

  try {
    const result = await repository.updateAddress(userId, {
      cep,
      city,
      complement,
      country,
      id,
      neighborhood,
      number,
      reference,
      state,
      street,
      uf,
      selected,
      isDefault,
    });

    return response(200, {
      message: "Endereço atualizado.",
      item: result.item,
    });
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      return response(404, {
        message: "Produto não encontrado no carrinho.",
      });
    }

    return response(500, { message: "Internal server error", error });
  }
}
