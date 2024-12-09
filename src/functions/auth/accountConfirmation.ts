import { cognitoClient } from "../../libs/cognitoClient";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import {
  CodeMismatchException,
  ConfirmSignUpCommand,
  ExpiredCodeException,
  UserNotFoundException,
} from "@aws-sdk/client-cognito-identity-provider";

import { response } from "../../utils/response";
import { bodyParser } from "../../utils/bodyParser";

export async function handler(event: APIGatewayProxyEventV2) {
  try {
    const { email, code } = bodyParser(event.body);

    const command = new ConfirmSignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    });

    await cognitoClient.send(command);

    return response(204);
  } catch (error) {
    if (error instanceof CodeMismatchException) {
      return response(406, {
        error: "Inválid code.",
      });
    }

    if (error instanceof ExpiredCodeException) {
      return response(406, {
        error: "Expired code.",
      });
    }

    if (error instanceof UserNotFoundException) {
      return response(404, {
        error: "User not found.",
      });
    }

    return response(500, {
      error: "Internal server error.",
    });
  }
}
