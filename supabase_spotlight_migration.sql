-- Spotlight Voting System Database Migration
-- Run this in Supabase SQL Editor

-- =====================================================
-- Table: spotlight_submissions
-- Stores user-submitted nail looks for voting
-- =====================================================
create table public.spotlight_submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  image_uri text not null,
  processed_image_uri text not null,
  color_hex text not null,
  color_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'active' check (status in ('active', 'archived')),
  yes_votes integer default 0,
  no_votes integer default 0,
  total_votes integer default 0
);

-- RLS Policies for spotlight_submissions
alter table public.spotlight_submissions enable row level security;

create policy "Anyone can view active submissions"
  on public.spotlight_submissions for select
  using (status = 'active');

create policy "Users can insert their own submissions"
  on public.spotlight_submissions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own submissions"
  on public.spotlight_submissions for update
  using (auth.uid() = user_id);

-- Indexes for spotlight_submissions
create index spotlight_submissions_user_id_idx on public.spotlight_submissions(user_id);
create index spotlight_submissions_status_idx on public.spotlight_submissions(status);
create index spotlight_submissions_created_at_idx on public.spotlight_submissions(created_at desc);

-- =====================================================
-- Table: spotlight_votes
-- Records individual votes with duplicate prevention
-- =====================================================
create table public.spotlight_votes (
  id uuid default gen_random_uuid() primary key,
  submission_id uuid references public.spotlight_submissions(id) on delete cascade not null,
  voter_id uuid references auth.users(id) on delete cascade not null,
  vote_type text not null check (vote_type in ('yes', 'no')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Prevent duplicate votes
  unique(submission_id, voter_id)
);

-- RLS Policies for spotlight_votes
alter table public.spotlight_votes enable row level security;

create policy "Users can view all votes"
  on public.spotlight_votes for select
  using (true);

create policy "Users can insert their own votes"
  on public.spotlight_votes for insert
  with check (auth.uid() = voter_id);

-- Indexes for spotlight_votes
create index spotlight_votes_submission_id_idx on public.spotlight_votes(submission_id);
create index spotlight_votes_voter_id_idx on public.spotlight_votes(voter_id);
create index spotlight_votes_created_at_idx on public.spotlight_votes(created_at desc);

-- =====================================================
-- Function: Update vote counts automatically
-- Triggered after each vote is inserted
-- =====================================================
create or replace function update_submission_vote_counts()
returns trigger as $$
begin
  update public.spotlight_submissions
  set 
    yes_votes = (select count(*) from public.spotlight_votes where submission_id = NEW.submission_id and vote_type = 'yes'),
    no_votes = (select count(*) from public.spotlight_votes where submission_id = NEW.submission_id and vote_type = 'no'),
    total_votes = (select count(*) from public.spotlight_votes where submission_id = NEW.submission_id)
  where id = NEW.submission_id;
  return NEW;
end;
$$ language plpgsql;

create trigger update_vote_counts_trigger
  after insert on public.spotlight_votes
  for each row
  execute function update_submission_vote_counts();

-- =====================================================
-- Verification Queries
-- =====================================================
-- Check tables created
-- select * from public.spotlight_submissions limit 5;
-- select * from public.spotlight_votes limit 5;

-- Check RLS policies
-- select * from pg_policies where tablename in ('spotlight_submissions', 'spotlight_votes');
