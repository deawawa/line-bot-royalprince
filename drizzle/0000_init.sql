-- Applied to Supabase project dhzjkupsxntigkisfglg (AFP RPRP2) on 2026-07-25
-- Migration name: rprp_linebot_init
-- All tables have RLS enabled with no policies: the app connects server-side
-- via DATABASE_URL (postgres role) which bypasses RLS; anon keys are blocked.

create table if not exists users (
  id serial primary key,
  line_user_id text not null unique,
  display_name text,
  language text default 'th',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists conversations (
  id serial primary key,
  line_user_id text not null,
  status text not null default 'active',
  last_intent text,
  summary text,
  human_handoff boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists conversations_line_user_idx on conversations (line_user_id);

create table if not exists messages (
  id serial primary key,
  conversation_id integer not null,
  role text not null,
  content text not null,
  intent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists messages_conversation_idx on messages (conversation_id);

create table if not exists leads (
  id serial primary key,
  line_user_id text not null,
  display_name text,
  language text,
  check_in text,
  check_out text,
  adults integer,
  children integer,
  room_type text,
  rooms integer,
  budget text,
  special_request text,
  intent text,
  lead_score text not null default 'COLD',
  status text not null default 'New',
  source text default 'line',
  campaign text,
  promotion text,
  booking_link_clicked boolean not null default false,
  human_handoff boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists leads_line_user_idx on leads (line_user_id);

create table if not exists promotions (
  id serial primary key,
  name text not null,
  description text not null,
  room_type text,
  rate text,
  currency text not null default 'THB',
  start_date text,
  end_date text,
  booking_start text,
  booking_end text,
  stay_start text,
  stay_end text,
  terms text,
  status text not null default 'draft',
  priority integer not null default 0,
  booking_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists knowledge_base (
  id serial primary key,
  title text not null,
  content text not null,
  category text not null,
  language text not null default 'th',
  status text not null default 'published',
  priority integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists kb_category_idx on knowledge_base (category);

create table if not exists booking_requests (
  id serial primary key,
  line_user_id text not null,
  check_in text,
  check_out text,
  adults integer,
  children integer,
  room_type text,
  rooms integer,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists events (
  id serial primary key,
  name text not null,
  line_user_id text,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists events_name_idx on events (name);

create table if not exists admin_users (
  id serial primary key,
  username text not null unique,
  password_hash text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id serial primary key,
  admin_user text not null,
  action text not null,
  entity text not null,
  entity_id text,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists settings (
  id serial primary key,
  key text not null unique,
  value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table users enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table leads enable row level security;
alter table promotions enable row level security;
alter table knowledge_base enable row level security;
alter table booking_requests enable row level security;
alter table events enable row level security;
alter table admin_users enable row level security;
alter table audit_logs enable row level security;
alter table settings enable row level security;
