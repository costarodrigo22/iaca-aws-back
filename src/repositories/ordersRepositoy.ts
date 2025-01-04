import { PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
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
  orderStatus: string;
  order_number_omie: string;
}

export class ordersRepository {
  private readonly tableName: string;

  constructor() {
    this.tableName = "AccountsTable";
  }

  async addOrder(userId: string, order: IOrder) {
    const orderId = uuidv4();
    const pk = `ACCOUNT#${userId}`;
    const sk = `ORDER#${order.order_number_omie}`;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");

    const orderNumber = `PEDIDO-${year}${month}${day}${hour}${minute}`;

    const {
      address,
      delivery_form,
      payment_form,
      products,
      total,
      order_number_omie,
      orderStatus,
    } = order;

    const createdAt = now.toISOString();

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
        order_number_omie: order_number_omie,
        orderStatus,
        createdAt,
      },
    };

    try {
      const command = new PutCommand(putParams);

      await dynamoClient.send(command);

      return {
        success: true,
        item: {
          id: orderId,
          address: address,
          products: products,
          total: total,
          payment_form: payment_form,
          delivery_form: delivery_form,
          order_number: orderNumber,
          orderStatus,
          createdAt,
        },
      };
    } catch (error) {
      return error;
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

  async getOrderById(userId: string, orderId: string) {
    const pk = `ACCOUNT#${userId}`;
    const sk = `ORDER#${orderId}`;

    try {
      const params = {
        TableName: this.tableName,
        ExpressionAttributeValues: {
          ":pk": pk,
          ":sk": sk,
        },
        KeyConditionExpression: "PK = :pk AND SK = :sk",
      };
      const command = new QueryCommand(params);

      const { Items } = await dynamoClient.send(command);

      if (!Items || Items.length === 0) {
        return { message: "Order not found" };
      }

      const responseMapped = mapOrderItem(Items[0] ?? {});

      return { success: true, item: responseMapped };
    } catch (error) {
      return error;
    }
  }

  async updateOrder(orderId: string, userId: string, newStatus: string) {
    const pk = `ACCOUNT#${userId}`;
    const sk = `ORDER#${orderId}`;

    try {
      const params = {
        TableName: this.tableName,
        Key: {
          PK: pk,
          SK: sk,
        },
        UpdateExpression: "SET orderStatus = :newStatus",
        ExpressionAttributeValues: {
          ":newStatus": newStatus,
        },
      };

      const command = new UpdateCommand(params);

      await dynamoClient.send(command);
    } catch (error) {
      throw error;
    }
  }
}
