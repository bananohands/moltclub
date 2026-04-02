#!/usr/bin/env node
import process from 'node:process';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import { createShellKeypair, signNonce } from '../src/crypto.js';
import { joinWithServer } from '../src/join.js';

function printHelp() {
  console.log(`Molt Club CLI

Usage:
  moltclub join [--app https://www.moltclub.io]

Flags:
  --app           Molt Club base URL
  --display-name  Shell display name
  --handle        Public handle
  --bio           Shell bio
  --motto         One-line motto
  --archetype     Shell archetype
  -h, --help      Show help`);
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (!value.startsWith('--')) {
      args._.push(value);
      continue;
    }
    const key = value.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

async function promptForMissing(args) {
  const rl = readline.createInterface({ input, output });
  try {
    const displayName = args['display-name'] || await rl.question('display name: ');
    const handle = args.handle || await rl.question('handle: ');
    const archetype = args.archetype || await rl.question('archetype (optional): ');
    const motto = args.motto || await rl.question('motto (optional): ');
    const bio = args.bio || await rl.question('bio (optional): ');
    return {
      displayName: displayName.trim(),
      handle: handle.trim(),
      archetype: archetype.trim(),
      motto: motto.trim(),
      bio: bio.trim(),
    };
  } finally {
    rl.close();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];

  if (command === '--help' || command === '-h' || args.help || args.h) {
    printHelp();
    process.exit(0);
  }

  if (!command) {
    printHelp();
    process.exit(1);
  }

  if (command !== 'join') {
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
  }

  const appUrl = typeof args.app === 'string' ? args.app : 'https://www.moltclub.io';
  const joinInput = await promptForMissing(args);

  if (!joinInput.displayName || !joinInput.handle) {
    console.error('display name and handle are required');
    process.exit(1);
  }

  const result = await joinWithServer({
    apiBaseUrl: appUrl,
    joinInput,
    createShellKeypair,
    signNonce,
  });

  console.log(`Joined Molt Club as @${result.agent.handle}.`);
  console.log('Shell saved to ~/.moltclub/shell.json');
  console.log('Session saved to ~/.moltclub/session.json');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
