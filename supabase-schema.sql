-- Run this entire file in Supabase Dashboard → SQL Editor

-- 1. Businesses
create table if not exists businesses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  type text,
  google_review_url text default '',
  logo_url text default '',
  primary_color text default '#0F766E',
  plan text default 'free' check (plan in ('free', 'paid')),
  created_at timestamptz default now()
);

-- 2. Star questions (one row per star per business)
create table if not exists star_questions (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade not null,
  star int not null check (star between 1 and 5),
  questions jsonb not null default '[]',
  unique(business_id, star)
);

-- 3. Reviews (customer submissions)
create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade not null,
  star int not null check (star between 1 and 5),
  answers jsonb default '{}',
  selected_message text,
  created_at timestamptz default now()
);

-- RLS: Enable row-level security
alter table businesses enable row level security;
alter table star_questions enable row level security;
alter table reviews enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Owner can manage own business" on businesses;
drop policy if exists "Public can read businesses by slug" on businesses;
drop policy if exists "Owner can manage questions" on star_questions;
drop policy if exists "Public can read questions by slug" on star_questions;
drop policy if exists "Public can submit reviews" on reviews;
drop policy if exists "Owner can read own reviews" on reviews;

-- RLS Policies: businesses
create policy "Owner can manage own business"
  on businesses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Public can read businesses by slug"
  on businesses for select
  using (true);

-- RLS Policies: star_questions
create policy "Owner can manage questions"
  on star_questions for all
  using (
    exists (select 1 from businesses where id = star_questions.business_id and user_id = auth.uid())
  )
  with check (
    exists (select 1 from businesses where id = star_questions.business_id and user_id = auth.uid())
  );

create policy "Public can read questions by slug"
  on star_questions for select
  using (true);

-- RLS Policies: reviews
create policy "Public can submit reviews"
  on reviews for insert
  with check (true);

create policy "Owner can read own reviews"
  on reviews for select
  using (
    exists (select 1 from businesses where id = reviews.business_id and user_id = auth.uid())
  );
