import { DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client } from "../libs/s3Client";

export async function cleanOldAvatars(userId: string, currentKey: string) {
  const bucketName = process.env.AVATAR_BUCKET;

  const listCommand = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: `${userId}-Avatar`, // Lista apenas os avatares do usuário
  });

  const listedObjects = await s3Client.send(listCommand);

  const objectsToDelete = listedObjects.Contents?.filter(
    (object) => object.Key !== currentKey
  ).map((object) => ({ Key: object.Key }));

  if (objectsToDelete && objectsToDelete.length > 0) {
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: objectsToDelete,
      },
    });

    await s3Client.send(deleteCommand);
  }
}
