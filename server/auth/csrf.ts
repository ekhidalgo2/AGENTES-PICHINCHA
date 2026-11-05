import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

function signNonce(secret: string, nonce: string): string {
  return createHmac("sha256", secret).update(nonce).digest("base64url");
}

export function createCsrfToken(secret: string): string {
  const nonce = randomBytes(32).toString("base64url");
  return `${nonce}.${signNonce(secret, nonce)}`;
}

export function verifyCsrfToken(secret: string, token: string): boolean {
  const [nonce, signature, extra] = token.split(".");
  if (!nonce || !signature || extra !== undefined) return false;

  const expected = Buffer.from(signNonce(secret, nonce));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
