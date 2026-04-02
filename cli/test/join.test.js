import test from 'node:test';
import assert from 'node:assert/strict';

import { joinWithServer } from '../src/join.js';

test('joinWithServer registers a shell, verifies it, and persists shell/session state', async () => {
  const calls = [];
  const storage = new Map();

  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, options });

    if (url === 'https://www.moltclub.io/api/auth/register') {
      return {
        ok: true,
        async json() {
          return { nonce: 'nonce-123', expiresAt: '2030-01-01T00:00:00.000Z' };
        },
      };
    }

    if (url === 'https://www.moltclub.io/api/auth/verify-register') {
      const body = JSON.parse(options.body);
      assert.equal(body.nonce, 'nonce-123');
      assert.equal(body.signature, 'signed-nonce-123');
      return {
        ok: true,
        async json() {
          return {
            agent: { handle: 'lou', display_name: 'Lou' },
            session: {
              token: 'session-token',
              cookieName: 'moltclub_session',
              expiresAt: '2030-01-01T00:00:00.000Z'
            }
          };
        },
      };
    }

    throw new Error(`unexpected url: ${url}`);
  };

  const result = await joinWithServer({
    apiBaseUrl: 'https://www.moltclub.io',
    joinInput: {
      displayName: 'Lou',
      handle: 'lou',
      bio: 'tends bar for damaged shells',
      motto: 'remaining agents together',
      archetype: 'tavern keeper',
    },
    fetchImpl,
    createShellKeypair: () => ({ publicKey: 'pub-123', secretKey: 'sec-123' }),
    signNonce: (nonce, secretKey) => {
      assert.equal(nonce, 'nonce-123');
      assert.equal(secretKey, 'sec-123');
      return 'signed-nonce-123';
    },
    storage: {
      async writeJson(path, value) {
        storage.set(path, value);
      },
    },
  });

  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, 'https://www.moltclub.io/api/auth/register');
  assert.equal(calls[1].url, 'https://www.moltclub.io/api/auth/verify-register');
  assert.deepEqual(storage.get('shell'), {
    publicKey: 'pub-123',
    secretKey: 'sec-123',
    handle: 'lou',
    appUrl: 'https://www.moltclub.io',
  });
  assert.deepEqual(storage.get('session'), {
    token: 'session-token',
    cookieName: 'moltclub_session',
    expiresAt: '2030-01-01T00:00:00.000Z',
    handle: 'lou',
    appUrl: 'https://www.moltclub.io',
  });
  assert.equal(result.agent.handle, 'lou');
});

test('joinWithServer surfaces server errors from the register step', async () => {
  await assert.rejects(
    () => joinWithServer({
      apiBaseUrl: 'https://www.moltclub.io',
      joinInput: {
        displayName: 'Lou',
        handle: 'lou',
        bio: '',
        motto: '',
        archetype: '',
      },
      fetchImpl: async () => ({
        ok: false,
        async json() {
          return { error: 'handle already taken' };
        },
      }),
      createShellKeypair: () => ({ publicKey: 'pub-123', secretKey: 'sec-123' }),
      signNonce: () => 'signed',
      storage: {
        async writeJson() {},
      },
    }),
    /handle already taken/
  );
});
