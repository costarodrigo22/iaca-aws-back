import { v4 as uuidv4 } from "uuid";
import { dynamoClient } from "../libs/dynamoClient";
import {
  PutCommand,
  UpdateCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { mapCartItem, mapCartItems } from "../mappers/cartMapper";

export interface IProduct {
  product_name: string;
  product_quantity: number;
  product_price: number;
  product_code: string;
  product_url_image: string;
}

export class CartRepository {
  private readonly tableName: string;

  constructor() {
    this.tableName = "AccountsTable";
  }

  async addItemToCart(userId: string, product: IProduct) {
    const pk = `ACCOUNT#${userId}`;
    const sk = `CART#${product.product_code}`;
    const itemId = uuidv4();

    const putParams = {
      TableName: this.tableName,
      Item: {
        PK: pk,
        SK: sk,
        id: itemId,
        type: "cart",
        product_name: product.product_name,
        product_quantity: product.product_quantity,
        product_price: product.product_price,
        product_code: product.product_code,
        product_url_image: product.product_url_image,
      },
    };

    try {
      const command = new PutCommand(putParams);

      const { Attributes } = await dynamoClient.send(command);

      const responseMapped = mapCartItem(Attributes ?? {});

      return { success: true, item: responseMapped };
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        return {
          success: false,
          message: "Produto já existe no carrinho.",
        };
      }

      throw error;
    }
  }

  async updateItemQuantity(
    userId: string,
    productCode: string,
    newQuantity: number
  ) {
    const pk = `ACCOUNT#${userId}`;
    const sk = `CART#${productCode}`;

    try {
      const updateParams = {
        TableName: this.tableName,
        Key: { PK: pk, SK: sk },
        UpdateExpression: "SET product_quantity = :newQuantity",
        ExpressionAttributeValues: {
          ":newQuantity": newQuantity,
        },
        ReturnValues: "ALL_NEW" as const,
      };

      const command = new UpdateCommand(updateParams);

      const { Attributes } = await dynamoClient.send(command);

      const responseMapped = mapCartItem(Attributes ?? {});

      return { success: true, item: responseMapped };
    } catch (error) {
      if (error.name instanceof ConditionalCheckFailedException) {
        return {
          success: false,
          message: "Produto já existe no carrinho.",
        };
      }
      throw error;
    }
  }

  async getCartItems(userId: string) {
    const pk = `ACCOUNT#${userId}`;

    try {
      const queryParams = {
        TableName: this.tableName,
        ExpressionAttributeValues: {
          ":pk": pk,
          ":cartPrefix": "CART#",
        },
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :cartPrefix)",
      };

      const command = new QueryCommand(queryParams);

      const { Items } = await dynamoClient.send(command);

      const responseMapped = mapCartItems(Items ?? []);

      return { success: true, item: responseMapped };
    } catch (error) {
      throw error;
    }
  }

  async deleteCartItem(userId: string, productCode: string) {
    const pk = `ACCOUNT#${userId}`;
    const sk = `CART#${productCode}`;

    try {
      const deleteParams = {
        TableName: this.tableName,
        Key: {
          PK: pk,
          SK: sk,
        },
      };

      const command = new DeleteCommand(deleteParams);

      await dynamoClient.send(command);

      return { success: true, message: "Item deletado com sucesso." };
    } catch (error) {
      throw new Error("Erro ao deletar o item do carrinho.");
    }
  }

  async clearCart(userId: string) {
    const pk = `ACCOUNT#${userId}`;

    try {
      const params = {
        TableName: this.tableName,
        KeyConditionExpression: "PK = :pk and begins_with(SK, :skPrefix)",
        ExpressionAttributeValues: {
          ":pk": pk,
          ":skPrefix": "CART#",
        },
      };

      const command = new QueryCommand(params);

      const { Items } = await dynamoClient.send(command);

      if (!Items || Items.length === 0) {
        return { success: true, message: "Carrinho já está vazio." };
      }

      const deletePromises = Items?.map((item) => {
        const deleteParams = {
          TableName: this.tableName,
          Key: {
            PK: pk,
            SK: item.SK,
          },
        };

        const commandDelete = new DeleteCommand(deleteParams);
        return dynamoClient.send(commandDelete);
      });

      await Promise.all(deletePromises);

      return { message: "Itens do carrinho removidos com sucesso." };
    } catch (error) {
      console.log(`erro ao deletar o carrinho <repository>: ${error}`);
      throw new Error(`Erro ao limpar o carrinho: ${error}`);
    }
  }
}
