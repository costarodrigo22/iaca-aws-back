import { cognitoClient } from "../../libs/cognitoClient";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import {
  InvalidParameterException,
  InvalidPasswordException,
  SignUpCommand,
  UsernameExistsException,
} from "@aws-sdk/client-cognito-identity-provider";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

import { v4 as uuidv4 } from "uuid";

import { response } from "../../utils/response";
import { bodyParser } from "../../utils/bodyParser";
import { dynamoClient } from "../../libs/dynamoClient";

export async function handler(event: APIGatewayProxyEventV2) {
  try {
    const body = bodyParser(event.body);

    const command = new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: body.email,
      Password: body.password,
      UserAttributes: [
        { Name: "given_name", Value: body.name },
        { Name: "phone_number", Value: body.phone },
        { Name: "email", Value: body.email },
      ],
    });

    const { UserSub } = await cognitoClient.send(command);

    const accountId = uuidv4();
    const pk = `ACCOUNT#${UserSub}`;
    const sk = pk;

    const putItemParams = {
      TableName: "AccountsTable",
      Item: {
        PK: pk,
        SK: sk,
        type: "account",
        id: accountId,
        cognito_id: UserSub,
        name: body.name,
        document: body.document,
        phone: body.phone,
        email: body.email,
        code_omie: body.code_omie,
        is_address_default_registered: false,
        avatarUrl: "",
      },
    };

    const commandPutItem = new PutCommand(putItemParams);

    await dynamoClient.send(commandPutItem).catch((error) => {
      if (error instanceof UsernameExistsException) {
        return response(409, {
          error: "Este e-mail já está em uso.",
          action: "resend_code",
        });
      }
    });

    return response(201, {
      user: {
        id: UserSub,
        name: body.name,
      },
    });
  } catch (error) {
    if (error instanceof UsernameExistsException) {
      return response(409, {
        error: "Este e-mail já está em uso.",
        action: "resend_code",
      });
    }

    if (error instanceof InvalidParameterException) {
      return response(406, {
        error: "Invalid phone. (Ex.: +5511111111111)",
      });
    }

    if (error instanceof InvalidPasswordException) {
      return response(406, {
        error: "Invalid password.",
      });
    }

    return response(500, {
      error: "Internal server error.",
    });
  }
}
