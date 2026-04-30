// R2 client + presigned URL helpers.
//
// R2 is S3-compatible — we use the AWS S3 SDK pointed at the R2 endpoint.
// All env vars are optional at module load: a missing config throws only at
// the moment of first use, so build/server start does not require credentials.

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let cachedClient: S3Client | null = null;
let cachedConfig: R2Config | null = null;

export type R2Config = {
  accountId: string;
  accessKey: string;
  secret: string;
  bucket: string;
  publicBaseUrl: string | null;
};

export class StorageNotConfiguredError extends Error {
  readonly statusCode = 503;
  constructor() {
    super("Object storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET, R2_BUCKET.");
    this.name = "StorageNotConfiguredError";
  }
}

export function readR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKey = process.env.R2_ACCESS_KEY;
  const secret = process.env.R2_SECRET;
  const bucket = process.env.R2_BUCKET;
  if (!accountId || !accessKey || !secret || !bucket) return null;
  return {
    accountId,
    accessKey,
    secret,
    bucket,
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? null
  };
}

function getClient(): { client: S3Client; config: R2Config } {
  if (cachedClient && cachedConfig) {
    return { client: cachedClient, config: cachedConfig };
  }
  const config = readR2Config();
  if (!config) throw new StorageNotConfiguredError();

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKey,
      secretAccessKey: config.secret
    }
  });

  cachedClient = client;
  cachedConfig = config;
  return { client, config };
}

export async function presignPutUrl(opts: {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}): Promise<{ url: string; publicUrl: string }> {
  const { client, config } = getClient();
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: opts.key,
    ContentType: opts.contentType
  });
  const url = await getSignedUrl(client, command, { expiresIn: opts.expiresInSeconds ?? 60 * 5 });
  const publicUrl = config.publicBaseUrl
    ? `${config.publicBaseUrl}/${opts.key}`
    : `https://${config.bucket}.${config.accountId}.r2.cloudflarestorage.com/${opts.key}`;
  return { url, publicUrl };
}

export async function presignGetUrl(opts: { key: string; expiresInSeconds?: number }): Promise<string> {
  const { client, config } = getClient();
  const command = new GetObjectCommand({ Bucket: config.bucket, Key: opts.key });
  return getSignedUrl(client, command, { expiresIn: opts.expiresInSeconds ?? 60 * 60 });
}

// Test seam — call between tests to drop the cached client.
export function _resetForTests() {
  cachedClient = null;
  cachedConfig = null;
}
