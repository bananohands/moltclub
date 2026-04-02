import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';

const binPath = path.resolve('./bin/moltclub.js');

function runBin(args, { stdin = 'ignore' } = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [binPath, ...args], {
      cwd: path.resolve('.'),
      stdio: [stdin, 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('close', (code) => resolve({ code, stdout, stderr }));

    if (stdin === 'pipe') {
      child.stdin.end();
    }
  });
}

test('moltclub --help exits successfully', async () => {
  const result = await runBin(['--help']);

  assert.equal(result.code, 0);
  assert.match(result.stdout, /Usage:/);
  assert.equal(result.stderr, '');
});

test('moltclub join exits non-zero and prints a required-fields error on EOF input', async () => {
  const result = await runBin(['join'], { stdin: 'pipe' });

  assert.equal(result.code, 1);
  assert.match(result.stderr, /display name and handle are required/);
});
