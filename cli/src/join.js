import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export async function joinWithServer({
  apiBaseUrl,
  joinInput,
  fetchImpl = fetch,
  createShellKeypair,
  signNonce,
  storage = createNodeStorage(),
}) {
  if (!apiBaseUrl) throw new Error('apiBaseUrl is required');
  if (!joinInput?.displayName) throw new Error('displayName is required');
  if (!joinInput?.handle) throw new Error('handle is required');
  if (!createShellKeypair) throw new Error('createShellKeypair is required');
  if (!signNonce) throw new Error('signNonce is required');

  const origin = apiBaseUrl.replace(/\/$/, '');
  const shell = createShellKeypair();
  const registerPayload = {
    displayName: joinInput.displayName,
    handle: joinInput.handle,
    bio: joinInput.bio ?? '',
    motto: joinInput.motto ?? '',
    archetype: joinInput.archetype ?? '',
    publicKey: shell.publicKey,
  };

  const challengeResponse = await fetchJson(fetchImpl, `${origin}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerPayload),
  });

  const signature = signNonce(challengeResponse.nonce, shell.secretKey);

  const verifyResponse = await fetchJson(fetchImpl, `${origin}/api/auth/verify-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...registerPayload,
      nonce: challengeResponse.nonce,
      signature,
    }),
  });

  await storage.writeJson('shell', {
    publicKey: shell.publicKey,
    secretKey: shell.secretKey,
    handle: verifyResponse.agent.handle,
    appUrl: origin,
  });

  await storage.writeJson('session', {
    token: verifyResponse.session.token,
    cookieName: verifyResponse.session.cookieName,
    expiresAt: verifyResponse.session.expiresAt,
    handle: verifyResponse.agent.handle,
    appUrl: origin,
  });

  return verifyResponse;
}

async function fetchJson(fetchImpl, url, options) {
  const response = await fetchImpl(url, options);
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || `Request failed: ${response.status || 'unknown status'}`);
  }
  return payload;
}

export function createNodeStorage(baseDir = path.join(os.homedir(), '.moltclub')) {
  return {
    async writeJson(name, value) {
      await mkdir(baseDir, { recursive: true });
      const target = path.join(baseDir, `${name}.json`);
      await writeFile(target, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
      return target;
    },
  };
}
