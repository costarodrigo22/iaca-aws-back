import { QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "../libs/dynamoClient";
import { userMapperItem } from "../mappers/usersMapper";

export class UserRepository {
  private readonly tableName: string;

  constructor() {
    this.tableName = "AccountsTable";
  }

  async getUser(userId: string) {
    const pk = `ACCOUNT#${userId}`;
    const sk = `ACCOUNT#${userId}`;

    try {
      const queryParams = {
        TableName: this.tableName,
        ExpressionAttributeValues: {
          ":pk": pk,
          ":sk": sk,
        },
        KeyConditionExpression: "PK = :pk AND SK = :sk",
      };

      const command = new QueryCommand(queryParams);

      const { Items } = await dynamoClient.send(command);

      const responseMapped = userMapperItem(Items ?? []);

      return { success: true, item: responseMapped };
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId: string) {
    const pk = `ACCOUNT#${userId}`;
    const sk = `ACCOUNT#${userId}`;

    try {
      const updateParams = {
        TableName: this.tableName,
        Key: { PK: pk, SK: sk },
        UpdateExpression:
          "SET is_address_default_registered = :isAddressDefaultRegistered",
        ExpressionAttributeValues: {
          ":isAddressDefaultRegistered": true,
        },
        ReturnValues: "ALL_NEW" as const,
      };

      const command = new UpdateCommand(updateParams);

      const { Attributes } = await dynamoClient.send(command);

      const responseMapped = userMapperItem(Attributes ?? []);

      return { success: true, item: responseMapped };
    } catch (error) {
      return {
        success: false,
        message: "Algo deu errado ao atualizar usuário.",
      };
    }
  }

  async updateAvatar(userId: string) {}
}
