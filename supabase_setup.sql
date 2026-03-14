-- RUN THIS IN YOUR SUPABASE SQL EDITOR --

-- Notes table
create table notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text,
  content text,
  summary text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Videos table
create table videos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  youtube_url text,
  video_id text,
  summary text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Jobs table
create table jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  query text,
  results text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tasks table (Schedule Manager)
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text,
  deadline text,
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table notes enable row level security;
alter table videos enable row level security;
alter table jobs enable row level security;
alter table tasks enable row level security;

-- Create Policies
create policy "Users can only access their own notes" on notes for all using (auth.uid() = user_id);
create policy "Users can only access their own videos" on videos for all using (auth.uid() = user_id);
create policy "Users can only access their own jobs" on jobs for all using (auth.uid() = user_id);
create policy "Users can only access their own tasks" on tasks for all using (auth.uid() = user_id);
