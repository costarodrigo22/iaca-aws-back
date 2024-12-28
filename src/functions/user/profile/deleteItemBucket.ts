import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { response } from "../../../utils/response";
import { s3Client } from "../../../libs/s3Client";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "../../../libs/dynamoClient";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;

  const bucketName = process.env.AVATAR_BUCKET;

  if (!userId) {
    return response(400, { error: "User ID é obrigatório." });
  }

  const prefix = `${userId}-Avatar`;

  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });

    const listResponse = await s3Client.send(listCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return response(404, {
        message: "Nenhum avatar encontrado para deletar.",
      });
    }

    const objectKey = listResponse.Contents[0].Key;

    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    await s3Client.send(deleteCommand);

    const updateCommand = new UpdateCommand({
      TableName: "AccountsTable",
      Key: {
        PK: `ACCOUNT#${userId}`,
        SK: `ACCOUNT#${userId}`,
      },
      UpdateExpression: "SET avatarUrl = :empty",
      ExpressionAttributeValues: {
        ":empty": "",
      },
    });

    await dynamoClient.send(updateCommand);

    return response(200, { message: "Avatar deletado com sucesso." });
  } catch (error) {
    return response(500, { message: "Erro ao deletar o avatar.", error });
  }
}
