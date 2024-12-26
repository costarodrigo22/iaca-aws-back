import { S3Event } from "aws-lambda";
import { response } from "../../../utils/response";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "../../../libs/dynamoClient";

export async function handler(event: S3Event) {
  const fileKey = event.Records[0].s3.object.key;

  const fileKeySplited = fileKey.split("-");

  const userId = fileKeySplited.slice(0, fileKeySplited.length - 1).join("-");

  const avatarKey = `${userId}-Avatar`;

  try {
    const updateParams = {
      TableName: "AccountsTable",
      Key: {
        PK: `ACCOUNT#${userId}`,
        SK: `ACCOUNT#${userId}`,
      },
      UpdateExpression: "SET avatarKey = :avatarKey",
      ExpressionAttributeValues: {
        ":avatarKey": avatarKey,
      },
    };

    const command = new UpdateCommand(updateParams);

    await dynamoClient.send(command);

    return response(201);
  } catch (error) {
    return response(500, { error, message: "Inernal server error." });
  }
}
