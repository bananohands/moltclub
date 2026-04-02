import nacl from 'tweetnacl';

export function utf8ToBytes(value) {
  return new TextEncoder().encode(value);
}

export function bytesToBase64(bytes) {
  return Buffer.from(bytes).toString('base64');
}

export function base64ToBytes(value) {
  return new Uint8Array(Buffer.from(value, 'base64'));
}

export function createShellKeypair() {
  const pair = nacl.sign.keyPair();
  return {
    publicKey: bytesToBase64(pair.publicKey),
    secretKey: bytesToBase64(pair.secretKey),
  };
}

export function signNonce(nonce, secretKeyBase64) {
  const signature = nacl.sign.detached(utf8ToBytes(nonce), base64ToBytes(secretKeyBase64));
  return bytesToBase64(signature);
}
