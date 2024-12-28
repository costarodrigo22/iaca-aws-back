import { cloudFrontClient } from "./../../../libs/cloudFrontClient";
import { CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { bodyParser } from "../../../utils/bodyParser";
import { response } from "../../../utils/response";
import { s3Client } from "../../../libs/s3Client";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;

  const { fileName } = bodyParser(event.body);

  const bucketName = process.env.AVATAR_BUCKET;

  if (!fileName) {
    return response(400, { error: "Nome do arquivo é obriatório." });
  }

  const newFileKey = `${userId}-Avatar-${Date.now()}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: newFileKey,
    CacheControl: "no-cache",
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

  return response(200, { signedUrl });
}
