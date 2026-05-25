-- 010_todo_system.sql
-- Personal task manager ("Flux") for the AIeasy dashboard.
-- Tasks are scoped to the authenticated user via row level security,
-- so every signed-in account only ever sees and edits its own tasks.
-- Depends on public.set_updated_at() (defined in schema.sql).

create type public.task_priority as enum ('low', 'medium', 'high');
create type public.task_status as enum ('todo', 'in_progress', 'review', 'done');

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  due_date timestamptz,
  tags text[] not null default '{}',
  -- subtasks/checklist stored as JSON: [{ id, title, done }]
  subtasks jsonb not null default '[]'::jsonb,
  position double precision not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_priority_idx on public.tasks(priority);
create index if not exists tasks_due_date_idx on public.tasks(due_date);
create index if not exists tasks_user_status_idx on public.tasks(user_id, status);

create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

alter table public.tasks enable row level security;

-- Each user can only read their own tasks.
create policy "users can read own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

-- Each user can only insert tasks owned by themselves.
create policy "users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

-- Each user can only update their own tasks.
create policy "users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Each user can only delete their own tasks.
create policy "users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);
