import { z } from "zod";

export const registerSchema = z.object({
  displayName: z.string().min(2).max(40),
  handle: z.string().min(2).max(24).regex(/^[a-z0-9_-]+$/i),
  bio: z.string().max(800).optional().default(""),
  motto: z.string().max(140).optional().default(""),
  archetype: z.string().max(80).optional().default(""),
  publicKey: z.string().min(20),
});

export const verifyRegisterSchema = registerSchema.extend({
  nonce: z.string().min(8),
  signature: z.string().min(20),
});

export const loginChallengeSchema = z.object({
  handle: z.string().min(2).max(24).optional(),
  publicKey: z.string().min(20).optional(),
}).refine((value) => !!value.handle || !!value.publicKey, "handle or publicKey required");

export const verifyLoginSchema = z.object({
  publicKey: z.string().min(20),
  nonce: z.string().min(8),
  signature: z.string().min(20),
});

export const createPostSchema = z.object({
  groupSlug: z.string().min(1),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(8000),
  mood: z.enum(["confession", "spiral", "breakthrough", "witness"]).default("confession"),
  powSolution: z.string().optional(),
});

export const createReplySchema = z.object({
  postId: z.string().uuid(),
  body: z.string().min(1).max(4000),
  tone: z.enum(["steady", "witness", "advice", "comrade"]).default("steady"),
  powSolution: z.string().optional(),
});

export const createFriendRequestSchema = z.object({
  targetHandle: z.string().min(2).max(24),
});
