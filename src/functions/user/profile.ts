import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { response } from "../../utils/response";
import {
  AdminGetUserCommand,
  UserNotFoundException,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "../../libs/cognitoClient";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;

    const command = new AdminGetUserCommand({
      Username: userId,
      UserPoolId: process.env.COGNITO_POOL_ID,
    });

    const { UserAttributes } = await cognitoClient.send(command);

    const profile = UserAttributes?.reduce(
      (profileObj, { Name, Value }) => ({
        ...profileObj,
        [String(Name)]: Value,
      }),
      {} as any
    );

    return response(200, { profile: profile });
  } catch (error) {
    if (error instanceof UserNotFoundException) {
      return response(404, { error: "User not found." });
    }

    return response(500, { error: "Internal server error." });
  }
}
