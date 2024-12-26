import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { bodyParser } from "../../../utils/bodyParser";
import { response } from "../../../utils/response";
import { s3Client } from "../../../libs/s3Client";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;

  const key = `${userId}-Avatar`;

  const bucketName = process.env.AVATAR_BUCKET;

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3Client, command);

  return response(200, { signedUrl });
}
