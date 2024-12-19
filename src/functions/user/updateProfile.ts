import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { response } from "../../utils/response";
import { UserNotFoundException } from "@aws-sdk/client-cognito-identity-provider";
import { UserRepository } from "../../repositories/userRepository";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;

    const repository = new UserRepository();

    try {
      const result = await repository.updateUser(userId);

      return response(200, {
        item: result,
      });
    } catch (error) {}
  } catch (error) {
    if (error instanceof UserNotFoundException) {
      return response(404, { error: "User not found." });
    }

    return response(500, { error: "Internal server error." });
  }
}
