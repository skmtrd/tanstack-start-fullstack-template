import { env } from "cloudflare:workers";

type PutImageObjectInput = {
  key: string;
  file: File;
  bucket?: R2Bucket;
  customMetadata?: Record<string, string>;
};

type DeleteImageObjectOptions = {
  bucket?: R2Bucket;
  logContext?: Record<string, unknown>;
};

export function getImageObject(key: string | null, bucket: R2Bucket = env.BUCKET) {
  if (!key) {
    return null;
  }

  return bucket.get(key);
}

export function putImageObject({
  key,
  file,
  bucket = env.BUCKET,
  customMetadata,
}: PutImageObjectInput) {
  return bucket.put(key, file, {
    httpMetadata: {
      contentType: file.type,
    },
    customMetadata,
  });
}

export async function deleteImageObject(key: string | null, bucket: R2Bucket = env.BUCKET) {
  if (key) {
    await bucket.delete(key);
  }
}

export async function deleteImageObjectSafely(
  key: string | null,
  { bucket = env.BUCKET, logContext }: DeleteImageObjectOptions = {},
) {
  try {
    await deleteImageObject(key, bucket);
  } catch (error) {
    console.warn("Image object cleanup failed", { key, ...logContext, error });
  }
}
