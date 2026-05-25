"use server";

import { revalidatePath } from "next/cache";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ActionResult, Subtask, Task, TaskInput, TaskStatus } from "@/types";

const TODO_PATH = "/dashboard/todo";

const notConfigured = (): ActionResult<never> => ({
  success: false,
  message:
    "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
});

/**
 * Resolve the Supabase client + the currently authenticated user.
 * Every task action is scoped to this user so row level security and
 * application logic agree: you only ever touch your own tasks.
 */
const getClientAndUser = async () => {
  if (!isSupabaseConfigured()) {
    return { supabase: null, userId: null as string | null };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { supabase: null, userId: null as string | null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, userId: user?.id ?? null };
};

/**
 * Read all tasks for the current user. Returns an array directly (mirroring
 * getContacts) so the page/client handoff stays simple. Returns [] when not
 * configured or not signed in — the page itself is auth-guarded by middleware.
 */
export const getTasks = async (): Promise<Task[]> => {
  const { supabase, userId } = await getClientAndUser();

  if (!supabase || !userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as Task[];
};

export const createTask = async (
  input: TaskInput,
): Promise<ActionResult<Task>> => {
  const { supabase, userId } = await getClientAndUser();

  if (!supabase) {
    return notConfigured();
  }

  if (!userId) {
    return { success: false, message: "You must be signed in." };
  }

  const title = input.title?.trim();

  if (!title) {
    return { success: false, message: "Task title is required." };
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      title,
      description: input.description ?? null,
      status: input.status ?? "todo",
      priority: input.priority ?? "medium",
      due_date: input.due_date ?? null,
      tags: input.tags ?? [],
      subtasks: input.subtasks ?? [],
      position: input.position ?? Date.now(),
    })
    .select("*")
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(TODO_PATH);
  return { success: true, data: data as Task };
};

export const updateTask = async (
  id: string,
  input: Partial<TaskInput> & { completed_at?: string | null },
): Promise<ActionResult<Task>> => {
  const { supabase, userId } = await getClientAndUser();

  if (!supabase) {
    return notConfigured();
  }

  if (!userId) {
    return { success: false, message: "You must be signed in." };
  }

  const patch: Record<string, unknown> = {};

  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.description !== undefined) patch.description = input.description;
  if (input.status !== undefined) patch.status = input.status;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.due_date !== undefined) patch.due_date = input.due_date;
  if (input.tags !== undefined) patch.tags = input.tags;
  if (input.subtasks !== undefined) patch.subtasks = input.subtasks;
  if (input.position !== undefined) patch.position = input.position;
  if (input.completed_at !== undefined) patch.completed_at = input.completed_at;

  const { data, error } = await supabase
    .from("tasks")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(TODO_PATH);
  return { success: true, data: data as Task };
};

/**
 * Toggle a task between done and not-done. When marking done we record
 * completed_at; when reopening we clear it and move the task back to "todo".
 */
export const toggleTask = async (
  id: string,
  done: boolean,
): Promise<ActionResult<Task>> => {
  return updateTask(id, {
    status: done ? "done" : "todo",
    completed_at: done ? new Date().toISOString() : null,
  });
};

export const moveTask = async (
  id: string,
  status: TaskStatus,
  position?: number,
): Promise<ActionResult<Task>> => {
  return updateTask(id, {
    status,
    completed_at: status === "done" ? new Date().toISOString() : null,
    ...(position !== undefined ? { position } : {}),
  });
};

export const setSubtasks = async (
  id: string,
  subtasks: Subtask[],
): Promise<ActionResult<Task>> => {
  return updateTask(id, { subtasks });
};

export const deleteTask = async (id: string): Promise<ActionResult> => {
  const { supabase, userId } = await getClientAndUser();

  if (!supabase) {
    return notConfigured();
  }

  if (!userId) {
    return { success: false, message: "You must be signed in." };
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(TODO_PATH);
  return { success: true };
};
