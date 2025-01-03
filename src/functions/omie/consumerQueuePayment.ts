import { ordersRepository } from "../../repositories/ordersRepositoy";

export async function handler(event: any) {
  const repositoty = new ordersRepository();

  const updatedItems = event.Records.map(async (record: any) => {
    const body = JSON.parse(record.body);
    await repositoty.updateOrder(
      body.orderId,
      body.userId,
      "Pagamento realizado"
    );
  });

  await Promise.all(updatedItems);
}
