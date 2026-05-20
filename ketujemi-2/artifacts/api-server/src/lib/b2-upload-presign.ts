import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function trimEnv(key: string): string {
  return process.env[key]?.trim() ?? "";
}

/** True when direct browser uploads to B2 via presigned PUT can be enabled. */
export function isB2UploadConfigured(): boolean {
  return !!(
    trimEnv("B2_S3_ENDPOINT") &&
    trimEnv("B2_APPLICATION_KEY_ID") &&
    trimEnv("B2_APPLICATION_KEY") &&
    trimEnv("B2_BUCKET_NAME") &&
    trimEnv("B2_PUBLIC_URL_BASE")
  );
}

function buildPublicDownloadUrl(base: string, objectKey: string): string {
  const b = base.replace(/\/$/, "");
  const path = objectKey.split("/").map(encodeURIComponent).join("/");
  return `${b}/${path}`;
}

let _s3: S3Client | null = null;

function getS3Client(): S3Client {
  if (_s3) return _s3;
  const endpoint = trimEnv("B2_S3_ENDPOINT");
  const region = trimEnv("B2_S3_REGION") || "us-east-1";
  _s3 = new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId: trimEnv("B2_APPLICATION_KEY_ID"),
      secretAccessKey: trimEnv("B2_APPLICATION_KEY"),
    },
    forcePathStyle: true,
  });
  return _s3;
}

/**
 * Presigned PUT URL for Backblaze B2 (S3-compatible API).
 * Bucket must allow public read for `B2_PUBLIC_URL_BASE` URLs to work in `<img src>`.
 */
export async function createB2ListingImagePresignedPut(opts: {
  objectKey: string;
  contentType: string;
  expiresInSeconds?: number;
}): Promise<{ uploadUrl: string; publicUrl: string }> {
  const Bucket = trimEnv("B2_BUCKET_NAME");
  const publicBase = trimEnv("B2_PUBLIC_URL_BASE");
  const client = getS3Client();

  const command = new PutObjectCommand({
    Bucket,
    Key: opts.objectKey,
    ContentType: opts.contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: opts.expiresInSeconds ?? 900,
  });

  const publicUrl = buildPublicDownloadUrl(publicBase, opts.objectKey);
  return { uploadUrl, publicUrl };
}
