-- Drum Chat database setup for Supabase.
-- Paste all of this into Supabase > SQL Editor > New query, then click Run. Safe to run more than once.

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  banned boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  topic text not null,
  title text not null check (char_length(title) between 3 and 140),
  body text not null default '' check (char_length(body) <= 5000),
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id bigint generated always as identity primary key,
  post_id bigint not null references public.posts(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.votes (
  post_id bigint not null references public.posts(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  primary key (post_id, user_id)
);

create table if not exists public.reports (
  id bigint generated always as identity primary key,
  post_id bigint references public.posts(id) on delete cascade,
  comment_id bigint references public.comments(id) on delete cascade,
  user_id uuid not null default auth.uid(),
  reason text check (char_length(reason) <= 300),
  created_at timestamptz not null default now()
);

-- Topics, plus classifieds (For Sale / Wanted) with price and location.
alter table public.posts add column if not exists price text check (char_length(price) <= 40);
alter table public.posts add column if not exists location text check (char_length(location) <= 60);
alter table public.posts drop constraint if exists posts_topic_check;
alter table public.posts add constraint posts_topic_check check (topic in ('general','gear','practice','kits','vintage','gigs','electronic','tech','forsale','wanted'));

-- The site owner (moderator) is identified by email.
create or replace function public.is_admin() returns boolean language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'douggarceau@gmail.com'
$$;

create or replace function public.can_post() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and not banned)
$$;

-- Simple flood protection: at most 5 posts and 20 comments per user per 10 minutes.
create or replace function public.rate_limit() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'posts' and (select count(*) from posts where user_id = new.user_id and created_at > now() - interval '10 minutes') >= 5 then
    raise exception 'Slow down: too many posts. Try again in a few minutes.';
  end if;
  if tg_table_name = 'comments' and (select count(*) from comments where user_id = new.user_id and created_at > now() - interval '10 minutes') >= 20 then
    raise exception 'Slow down: too many replies. Try again in a few minutes.';
  end if;
  return new;
end $$;
drop trigger if exists posts_rate on public.posts;
create trigger posts_rate before insert on public.posts for each row execute function public.rate_limit();
drop trigger if exists comments_rate on public.comments;
create trigger comments_rate before insert on public.comments for each row execute function public.rate_limit();

-- Feed with scores, reply counts and usernames.
drop view if exists public.post_feed;
create view public.post_feed with (security_invoker = true) as
select p.id, p.topic, p.title, p.body, p.price, p.location, p.created_at, p.user_id, pr.username,
  coalesce((select sum(v.value) from public.votes v where v.post_id = p.id), 0)::int as score,
  (select count(*) from public.comments c where c.post_id = p.id)::int as replies
from public.posts p join public.profiles pr on pr.id = p.user_id;

create or replace view public.comment_feed with (security_invoker = true) as
select c.id, c.post_id, c.body, c.created_at, c.user_id, pr.username
from public.comments c join public.profiles pr on pr.id = c.user_id;

-- Row level security: everyone can read; only signed-in, non-banned members can write their own things.
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.votes enable row level security;
alter table public.reports enable row level security;

drop policy if exists "read profiles" on public.profiles;
create policy "read profiles" on public.profiles for select using (true);
drop policy if exists "create own profile" on public.profiles;
create policy "create own profile" on public.profiles for insert with check (id = auth.uid() and banned = false);
drop policy if exists "admin bans" on public.profiles;
create policy "admin bans" on public.profiles for update using (public.is_admin());

drop policy if exists "read posts" on public.posts;
create policy "read posts" on public.posts for select using (true);
drop policy if exists "write posts" on public.posts;
create policy "write posts" on public.posts for insert with check (user_id = auth.uid() and public.can_post());
drop policy if exists "delete posts" on public.posts;
create policy "delete posts" on public.posts for delete using (user_id = auth.uid() or public.is_admin());

drop policy if exists "read comments" on public.comments;
create policy "read comments" on public.comments for select using (true);
drop policy if exists "write comments" on public.comments;
create policy "write comments" on public.comments for insert with check (user_id = auth.uid() and public.can_post());
drop policy if exists "delete comments" on public.comments;
create policy "delete comments" on public.comments for delete using (user_id = auth.uid() or public.is_admin());

drop policy if exists "read votes" on public.votes;
create policy "read votes" on public.votes for select using (true);
drop policy if exists "vote" on public.votes;
create policy "vote" on public.votes for insert with check (user_id = auth.uid() and public.can_post());
drop policy if exists "change vote" on public.votes;
create policy "change vote" on public.votes for update using (user_id = auth.uid());
drop policy if exists "remove vote" on public.votes;
create policy "remove vote" on public.votes for delete using (user_id = auth.uid());

drop policy if exists "report" on public.reports;
create policy "report" on public.reports for insert with check (user_id = auth.uid());
drop policy if exists "admin reads reports" on public.reports;
create policy "admin reads reports" on public.reports for select using (public.is_admin());
drop policy if exists "admin clears reports" on public.reports;
create policy "admin clears reports" on public.reports for delete using (public.is_admin());

grant select on public.post_feed, public.comment_feed to anon, authenticated;
