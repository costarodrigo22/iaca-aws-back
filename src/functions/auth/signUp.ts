import { cognitoClient } from "../../libs/cognitoClient";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import {
  InvalidParameterException,
  InvalidPasswordException,
  SignUpCommand,
  UsernameExistsException,
} from "@aws-sdk/client-cognito-identity-provider";

import { response } from "../../utils/response";
import { bodyParser } from "../../utils/bodyParser";

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

    return response(201, {
      user: {
        id: UserSub,
        name: body.name,
      },
    });
  } catch (error) {
    if (error instanceof UsernameExistsException) {
      return response(409, {
        error: "This e-email is already in use.",
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
