import nacl from "tweetnacl";
import { base64ToBytes, bytesToBase64, utf8ToBytes } from "@/lib/auth/encoding";

export function verifySignature(params: {
  nonce: string;
  signature: string;
  publicKey: string;
}) {
  return nacl.sign.detached.verify(
    utf8ToBytes(params.nonce),
    base64ToBytes(params.signature),
    base64ToBytes(params.publicKey),
  );
}

export function generateNonce() {
  return bytesToBase64(nacl.randomBytes(24));
}
