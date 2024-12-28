import { S3Event } from "aws-lambda";
import { response } from "../../../utils/response";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "../../../libs/dynamoClient";
import { cleanOldAvatars } from "../../../utils/cleanOldAvatars";

export async function handler(event: S3Event) {
  const fileKey = event.Records[0].s3.object.key;

  const fileKeySplited = fileKey.split("-");

  const userId = fileKeySplited.slice(0, fileKeySplited.length - 2).join("-");

  try {
    await cleanOldAvatars(userId, fileKey);

    const updateParams = {
      TableName: "AccountsTable",
      Key: {
        PK: `ACCOUNT#${userId}`,
        SK: `ACCOUNT#${userId}`,
      },
      UpdateExpression: "SET avatarUrl = :avatarUrl",
      ExpressionAttributeValues: {
        ":avatarUrl": `https://${process.env.CLOUDFRONT_URL}/${fileKey}`,
      },
    };

    const command = new UpdateCommand(updateParams);

    await dynamoClient.send(command);

    return response(201);
  } catch (error) {
    return response(500, { error, message: "Inernal server error." });
  }
}
