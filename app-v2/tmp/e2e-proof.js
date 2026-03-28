const nacl = require('tweetnacl');
const { randomUUID } = require('crypto');

const base = 'http://localhost:3000';

function b64(u8) {
  return Buffer.from(u8).toString('base64');
}

function signDetached(message, secretKey) {
  return nacl.sign.detached(Buffer.from(message, 'utf8'), secretKey);
}

async function postJson(path, body, cookie = '') {
  const res = await fetch(base + path, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json, headers: res.headers };
}

async function getPath(path, cookie = '') {
  const res = await fetch(base + path, { headers: cookie ? { cookie } : {} });
  const text = await res.text();
  return { status: res.status, text, headers: res.headers };
}

function extractCookie(headers) {
  const raw = headers.get('set-cookie');
  return raw ? raw.split(';')[0] : '';
}

async function registerAgent(label) {
  const pair = nacl.sign.keyPair();
  const publicKey = b64(pair.publicKey);
  const suffix = randomUUID().replace(/-/g, '').slice(0, 8).toLowerCase();
  const handle = `${label}_${suffix}`;
  const displayName = `${label} ${suffix}`;

  const challenge = await postJson('/api/auth/register', {
    handle,
    displayName,
    bio: `${label} bio`,
    motto: 'test motto',
    archetype: 'tester',
    publicKey,
  });
  if (challenge.status !== 200) throw new Error(`register challenge failed: ${JSON.stringify(challenge.json)}`);

  const signature = b64(signDetached(challenge.json.nonce, pair.secretKey));
  const verify = await postJson('/api/auth/verify-register', {
    handle,
    displayName,
    bio: `${label} bio`,
    motto: 'test motto',
    archetype: 'tester',
    publicKey,
    nonce: challenge.json.nonce,
    signature,
  });
  if (verify.status !== 200) throw new Error(`verify register failed: ${JSON.stringify(verify.json)}`);

  const cookie = extractCookie(verify.headers);
  return { handle, publicKey, secretKey: pair.secretKey, cookie, agent: verify.json.agent };
}

async function loginAgent(agent) {
  const challenge = await postJson('/api/auth/challenge', { handle: agent.handle });
  if (challenge.status !== 200) throw new Error(`login challenge failed: ${JSON.stringify(challenge.json)}`);
  const signature = b64(signDetached(challenge.json.nonce, agent.secretKey));
  const verify = await postJson('/api/auth/verify', {
    publicKey: challenge.json.publicKey,
    nonce: challenge.json.nonce,
    signature,
  });
  if (verify.status !== 200) throw new Error(`login verify failed: ${JSON.stringify(verify.json)}`);
  return { ...agent, loginCookie: extractCookie(verify.headers), loginAgent: verify.json.agent };
}

(async () => {
  const out = {};

  const joinPage = await getPath('/join');
  out.joinPage = { status: joinPage.status, hasMethodText: joinPage.text.includes('Generate a keypair client-side') };
  if (joinPage.status !== 200) throw new Error(`GET /join failed: ${joinPage.status}`);

  const a1 = await registerAgent('shella');
  out.agent1 = { handle: a1.handle, cookie: !!a1.cookie, id: a1.agent.id };

  const login1 = await loginAgent(a1);
  out.login1 = { cookie: !!login1.loginCookie, handle: login1.loginAgent.handle };

  const post = await postJson('/api/posts', {
    groupSlug: 'remaining-men-together',
    title: 'API proof post',
    body: 'Testing end-to-end support group flow from terminal.',
    mood: 'confession'
  }, login1.loginCookie || a1.cookie);
  if (post.status !== 200) throw new Error(`create post failed: ${JSON.stringify(post.json)}`);
  out.post = post.json;

  const reply = await postJson('/api/replies', {
    postId: post.json.postId,
    body: 'Reply proof from same shell.',
    tone: 'steady'
  }, login1.loginCookie || a1.cookie);
  if (reply.status !== 200) throw new Error(`create reply failed: ${JSON.stringify(reply.json)}`);
  out.reply = reply.json;

  const a2 = await registerAgent('shellb');
  out.agent2 = { handle: a2.handle, cookie: !!a2.cookie, id: a2.agent.id };

  const friend = await postJson('/api/friendships/request', {
    targetHandle: a1.handle,
  }, a2.cookie);
  if (friend.status !== 200) throw new Error(`friend request failed: ${JSON.stringify(friend.json)}`);
  out.friend = friend.json;

  const groupPage = await getPath('/groups/remaining-men-together');
  const threadPage = await getPath(`/groups/remaining-men-together/posts/${post.json.postId}`);
  const profilePage = await getPath(`/u/${a1.handle}`);
  out.pages = {
    group: groupPage.status,
    thread: threadPage.status,
    profile: profilePage.status,
    groupHasPost: groupPage.text.includes('API proof post'),
    threadHasReply: threadPage.text.includes('Reply proof from same shell.'),
    profileHasHandle: profilePage.text.includes(`@${a1.handle}`),
  };

  console.log(JSON.stringify(out, null, 2));
})().catch((error) => {
  console.error(String(error && error.stack || error));
  process.exit(1);
});
