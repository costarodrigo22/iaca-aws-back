import { ordersRepository } from "../../repositories/ordersRepositoy";
import { bodyParser } from "../../utils/bodyParser";

export async function handler(event: any) {
  event.Records.forEach(async (record: any) => {
    const repositoty = new ordersRepository();
    try {
      const body = bodyParser(record.body);

      await repositoty.updateOrder(
        body.orderId,
        body.userId,
        "Pagamento realizado"
      );

      console.log(`Pedido ${body.orderId} atualizado com sucesso.`);
    } catch (error) {
      console.log("erro de atulizar: ", error);
      return error;
    }
  });
}
