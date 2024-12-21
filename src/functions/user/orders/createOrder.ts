import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { bodyParser } from "../../../utils/bodyParser";
import { ordersRepository } from "../../../repositories/ordersRepositoy";
import { IUpdateAddress } from "../../../repositories/addressRepository";
import { IProduct } from "../../../repositories/cartRepository";
import { response } from "../../../utils/response";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;
  const body = bodyParser(event.body);

  const repositoty = new ordersRepository();

  const order = {
    address: body.address as IUpdateAddress,
    products: body.products as Array<IProduct & { id: string }>,
    total: body.total,
    payment_form: body.payment_form,
    delivery_form: body.delivery_form,
    order_number_omie: body.order_number_omie,
  };

  try {
    const result = await repositoty.addOrder(userId, order);

    return response(201, {
      message: "Pedido cadastrado com sucesso.",
      item: result.item,
    });
  } catch (error) {
    return response(500, {
      message: "Erro ao adicionar item ao carrinho.",
      error,
    });
  }
}
