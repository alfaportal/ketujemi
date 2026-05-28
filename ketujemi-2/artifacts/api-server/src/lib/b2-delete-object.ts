import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  isDeletableListingB2ObjectKey,
  parseB2ObjectKeyFromPublicUrl,
} from "../../../../lib/b2-asset.js";
import { isB2UploadConfigured } from "./b2-upload-presign";
import { logger } from "./logger";

let _s3: S3Client | null = null;

function trimEnv(key: string): string {
  return process.env[key]?.trim() ?? "";
}

function getS3Client(): S3Client {
  if (_s3) return _s3;
  _s3 = new S3Client({
    endpoint: trimEnv("B2_S3_ENDPOINT"),
    region: trimEnv("B2_S3_REGION") || "us-east-1",
    credentials: {
      accessKeyId: trimEnv("B2_APPLICATION_KEY_ID"),
      secretAccessKey: trimEnv("B2_APPLICATION_KEY"),
    },
    forcePathStyle: true,
  });
  return _s3;
}

/** Delete listing object from B2. Skips protected prefixes (`partners/`, `site-assets/`). */
export async function deleteB2ObjectByPublicUrl(url: string): Promise<boolean> {
  if (!isB2UploadConfigured()) return false;

  const objectKey = parseB2ObjectKeyFromPublicUrl(url);
  if (!objectKey || !isDeletableListingB2ObjectKey(objectKey)) {
    if (objectKey) {
      logger.debug({ objectKey }, "skip B2 delete (protected or not a listing key)");
    }
    return false;
  }

  try {
    await getS3Client().send(
      new DeleteObjectCommand({
        Bucket: trimEnv("B2_BUCKET_NAME"),
        Key: objectKey,
      }),
    );
    return true;
  } catch (err) {
    logger.warn({ err, objectKey }, "B2 delete failed");
    return false;
  }
}
