import {
  DeleteCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { dynamoClient } from "../libs/dynamoClient";
import { mapAddressItem, mapAddressItems } from "../mappers/addressMapper";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";

export interface IAddress {
  cep: string;
  country: string;
  street: string;
  number: number;
  neighborhood: string;
  complement: string;
  city: string;
  state: string;
  uf: string;
  reference: string;
  selected: boolean;
}

export interface IUpdateAddress extends IAddress {
  id: string;
}

export class addressRepository {
  private readonly tableName: string;

  constructor() {
    this.tableName = "AccountsTable";
  }

  async addAddress(userId: string, address: IAddress) {
    const itemId = uuidv4();
    const pk = `ACCOUNT#${userId}`;
    const sk = `ADDRESS#${itemId}`;

    const putParams = {
      TableName: this.tableName,
      Item: {
        PK: pk,
        SK: sk,
        id: itemId,
        type: "address",
        cep: address.cep,
        country: address.country,
        street: address.street,
        number: address.number,
        neighborhood: address.neighborhood,
        complement: address.complement,
        city: address.city,
        state: address.state,
        uf: address.uf,
        reference: address.reference,
        selected: address.selected,
      },
    };

    try {
      const command = new PutCommand(putParams);

      const { Attributes } = await dynamoClient.send(command);

      const responseMapped = mapAddressItem(Attributes ?? {});

      return { success: true, item: responseMapped };
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        return {
          success: false,
          message: "Endereço já existe.",
        };
      }

      throw error;
    }
  }

  async getAddress(userId: string) {
    const pk = `ACCOUNT#${userId}`;

    try {
      const queryParams = {
        TableName: this.tableName,
        ExpressionAttributeValues: {
          ":pk": pk,
          ":addressPrefix": "ADDRESS#",
        },
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :addressPrefix)",
      };

      const command = new QueryCommand(queryParams);

      const { Items } = await dynamoClient.send(command);

      const responseMapped = mapAddressItems(Items ?? []);

      return { success: true, item: responseMapped };
    } catch (error) {
      throw error;
    }
  }

  async deleteAddress(userId: string, addressId: string) {
    const pk = `ACCOUNT#${userId}`;
    const sk = `ADDRESS#${addressId}`;

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

      return { success: true, message: "Endereço deletado com sucesso." };
    } catch (error) {
      throw new Error("Erro ao deletar o endereço.");
    }
  }

  async updateItemQuantity(userId: string, address: IUpdateAddress) {
    const pk = `ACCOUNT#${userId}`;
    const sk = `ADDRESS#${address.id}`;

    const { id, ...addressToUpdate } = address;

    const updateExpression = `SET ${Object.keys(addressToUpdate)
      .map((key) => `#${key} = :${key}`)
      .join(", ")}`;

    const expressionAttributeValues = Object.fromEntries(
      Object.entries(addressToUpdate).map(([key, value]) => [`:${key}`, value])
    );

    const expressionAttributeNames = Object.fromEntries(
      Object.keys(addressToUpdate).map((key) => [`#${key}`, key])
    );

    try {
      const updateParams = {
        TableName: this.tableName,
        Key: { PK: pk, SK: sk },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: "ALL_NEW" as const,
      };

      const command = new UpdateCommand(updateParams);

      const { Attributes } = await dynamoClient.send(command);

      const responseMapped = mapAddressItem(Attributes ?? {});

      return { success: true, item: responseMapped };
    } catch (error) {
      if (error.name instanceof ConditionalCheckFailedException) {
        return {
          success: false,
          message: "Endereço já existe.",
        };
      }
      throw error;
    }
  }

  async deselectAllAddresses(userId: string) {
    const pk = `ACCOUNT#${userId}`;

    const queryParams = {
      TableName: this.tableName,
      ExpressionAttributeValues: {
        ":pk": pk,
        ":addressPrefix": "ADDRESS#",
      },
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :addressPrefix)",
    };

    const command = new QueryCommand(queryParams);

    const { Items } = await dynamoClient.send(command);

    const updateItems = Items?.map((item) => {
      const sk = item.SK;

      const updateParams = {
        TableName: this.tableName,
        Key: { PK: pk, SK: sk },
        UpdateExpression: "SET #selected = :false",
        ExpressionAttributeNames: {
          "#selected": "selected",
        },
        ExpressionAttributeValues: {
          ":false": false,
        },
      };

      return dynamoClient.send(new UpdateCommand(updateParams));
    });

    if (updateItems) {
      await Promise.all(updateItems);
    }
  }

  async selectAddress(userId: string, addressId: string) {
    const pk = `ACCOUNT#${userId}`;
    const sk = `ADDRESS#${addressId}`;

    try {
      const updateParams = {
        TableName: this.tableName,
        Key: { PK: pk, SK: sk },
        UpdateExpression: "SET #selected = :true",
        ExpressionAttributeNames: {
          "#selected": "selected",
        },
        ExpressionAttributeValues: {
          ":true": true,
        },
        ReturnValues: "ALL_NEW" as const,
      };

      const command = new UpdateCommand(updateParams);
      const { Attributes } = await dynamoClient.send(command);

      const responseMapped = mapAddressItem(Attributes ?? {});

      return { success: true, item: responseMapped };
    } catch (error) {
      if (error.name instanceof ConditionalCheckFailedException) {
        return {
          success: false,
          message: "Endereço já existe.",
        };
      }
      throw error;
    }
  }

  async getSelectedAddress(userId: string) {
    const pk = `ACCOUNT#${userId}`;

    const queryParams = {
      TableName: this.tableName,
      ExpressionAttributeValues: {
        ":pk": pk,
        ":addressPrefix": "ADDRESS#",
        ":selected": true,
      },
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :addressPrefix)",
      FilterExpression: "#selected = :selected",
      ExpressionAttributeNames: {
        "#selected": "selected",
      },
    };

    const command = new QueryCommand(queryParams);

    const { Items } = await dynamoClient.send(command);

    return Items?.length ? mapAddressItem(Items[0]) : null;
  }
}
