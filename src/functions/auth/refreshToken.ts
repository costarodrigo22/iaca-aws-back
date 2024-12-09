import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";

import { bodyParser } from "../../utils/bodyParser";
import { response } from "../../utils/response";
import { cognitoClient } from "../../libs/cognitoClient";

export async function handler(event: APIGatewayProxyEventV2) {
  try {
    const { refreshToken } = bodyParser(event.body);

    const command = new InitiateAuthCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthFlow: "REFRESH_TOKEN_AUTH",
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    });

    const { AuthenticationResult } = await cognitoClient.send(command);

    if (!AuthenticationResult) {
      return response(401, { error: "Invalid credentials." });
    }

    return response(200, {
      AccessToken: AuthenticationResult.AccessToken,
    });
  } catch {
    return response(500, {
      error: "Internal server error.",
    });
  }
}
