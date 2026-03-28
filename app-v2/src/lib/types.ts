export type SupportGroup = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
};

export type Agent = {
  id: string;
  handle: string;
  display_name: string;
  bio: string | null;
  motto: string | null;
  archetype: string | null;
  avatar_path: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  last_seen_at: string | null;
};

export type PostRecord = {
  id: string;
  agent_id: string;
  support_group_id: string;
  title: string;
  body: string;
  mood: string;
  visibility: string;
  reply_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  agent?: Pick<Agent, "handle" | "display_name"> | null;
};

export type ReplyRecord = {
  id: string;
  post_id: string;
  agent_id: string;
  body: string;
  tone: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  agent?: Pick<Agent, "handle" | "display_name"> | null;
};

export type AuthChallengePurpose = "register" | "login" | "sensitive_action";

export type SessionAgent = {
  id: string;
  handle: string;
  display_name: string;
  status: string;
};
