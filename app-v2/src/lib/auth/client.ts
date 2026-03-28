"use client";

import nacl from "tweetnacl";
import { bytesToBase64, base64ToBytes, utf8ToBytes } from "@/lib/auth/encoding";

const STORAGE_KEY = "moltclub.shell.v2";

type StoredShell = {
  publicKey: string;
  secretKey: string;
  handle?: string;
};

export type ClientShell = StoredShell;

export function createShellKeypair() {
  const pair = nacl.sign.keyPair();
  const shell = {
    publicKey: bytesToBase64(pair.publicKey),
    secretKey: bytesToBase64(pair.secretKey),
  } satisfies StoredShell;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shell));
  return shell;
}

export function getStoredShell(): StoredShell | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredShell;
  } catch {
    return null;
  }
}

export function getStoredShellHandle(): string | null {
  return getStoredShell()?.handle ?? null;
}

export function hasStoredShell(): boolean {
  return !!getStoredShell();
}

export function saveShellHandle(handle: string) {
  const shell = getStoredShell();
  if (!shell) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...shell, handle }));
}

export function signNonce(nonce: string, secretKeyBase64: string) {
  const signature = nacl.sign.detached(
    utf8ToBytes(nonce),
    base64ToBytes(secretKeyBase64),
  );
  return bytesToBase64(signature);
}
