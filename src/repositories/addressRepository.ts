import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { dynamoClient } from "../libs/dynamoClient";
import { mapAddressItem } from "../mappers/addressMapper";
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
}
