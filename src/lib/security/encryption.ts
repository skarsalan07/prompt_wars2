import crypto from "node:crypto";

const algorithm = "aes-256-gcm";

function getKey() {
  const secret = process.env.ENCRYPTION_KEY ?? "development-encryption-key-change-me";
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptText(plainText: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decryptText(payload: string) {
  const rawBuffer = Buffer.from(payload, "base64");
  const iv = rawBuffer.subarray(0, 12);
  const authTag = rawBuffer.subarray(12, 28);
  const encrypted = rawBuffer.subarray(28);
  const decipher = crypto.createDecipheriv(algorithm, getKey(), iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}
