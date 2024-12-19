import {
  APIGatewayProxyEventV2,
  APIGatewayProxyEventV2WithJWTAuthorizer,
} from "aws-lambda";
import { response } from "../../utils/response";
import {
  AdminGetUserCommand,
  ResendConfirmationCodeCommand,
  UserNotFoundException,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "../../libs/cognitoClient";
import { bodyParser } from "../../utils/bodyParser";

export async function handler(event: APIGatewayProxyEventV2) {
  const body = bodyParser(event.body);

  try {
    const command = new AdminGetUserCommand({
      Username: body.email,
      UserPoolId: process.env.COGNITO_POOL_ID,
    });

    const { UserStatus } = await cognitoClient.send(command);

    if (UserStatus === "UNCONFIRMED") {
      const resendCommand = new ResendConfirmationCodeCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: body.email,
      });

      await cognitoClient.send(resendCommand);

      return response(409, {
        message:
          "Usuário já existe em nossa base. Foi reenviado um novo código de confirmação.",
        action: "resend_code",
      });
    }

    return response(409, {
      message: "Este email já está em uso.",
    });
  } catch (error) {
    if (error instanceof UserNotFoundException) {
      return response(404, { error: "User not found." });
    }

    return response(500, { error: "Internal server error." });
  }
}
