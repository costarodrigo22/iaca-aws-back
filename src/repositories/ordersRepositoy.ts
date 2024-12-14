import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { IUpdateAddress } from "./addressRepository";
import { IProduct } from "./cartRepository";
import { v4 as uuidv4 } from "uuid";
import { dynamoClient } from "../libs/dynamoClient";
import { mapOrderItem, mapOrderItems } from "../mappers/orderMapper";

interface IOrder {
  address: IUpdateAddress;
  products: Array<IProduct & { id: string }>;
  total: number;
  payment_form: string;
  delivery_form: string;
}

export class ordersRepository {
  private readonly tableName: string;

  constructor() {
    this.tableName = "AccountsTable";
  }

  async addOrder(userId: string, order: IOrder) {
    const orderId = uuidv4();
    const pk = `ACCOUNT#${userId}`;
    const sk = `ORDER#${orderId}`;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");

    const orderNumber = `PEDIDO-${year}${month}${day}${hour}${minute}`;

    const { address, delivery_form, payment_form, products, total } = order;

    const putParams = {
      TableName: this.tableName,
      Item: {
        PK: pk,
        SK: sk,
        type: "order",
        id: orderId,
        address: address,
        products: products,
        total: total,
        payment_form: payment_form,
        delivery_form: delivery_form,
        order_number: orderNumber,
      },
    };

    try {
      const command = new PutCommand(putParams);

      const { Attributes } = await dynamoClient.send(command);

      const responseMapped = mapOrderItem(Attributes ?? {});

      return { success: true, item: responseMapped };
    } catch (error) {
      throw error;
    }
  }

  async getOrders(userId: string) {
    const pk = `ACCOUNT#${userId}`;

    const queryParams = {
      TableName: this.tableName,
      ExpressionAttributeValues: {
        ":pk": pk,
        ":orderPrefix": "ORDER#",
      },
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :orderPrefix)",
    };

    try {
      const command = new QueryCommand(queryParams);

      const { Items } = await dynamoClient.send(command);

      const responseMapped = mapOrderItems(Items ?? []);

      return { success: true, item: responseMapped };
    } catch (error) {
      throw error;
    }
  }
}
