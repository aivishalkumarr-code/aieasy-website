"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  Flag,
  LayoutGrid,
  List as ListIcon,
  LoaderCircle,
  Plus,
  Search,
  Tag as TagIcon,
  Trash2,
  X,
} from "lucide-react";

import {
  createTask,
  deleteTask,
  moveTask,
  toggleTask,
  updateTask,
} from "@/app/dashboard/actions/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  type Subtask,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/types";

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

const uid = () => Math.random().toString(36).slice(2, 10);

const PRIORITY_STYLES: Record<
  TaskPriority,
  { dot: string; badge: string; label: string }
> = {
  high: {
    dot: "bg-[#DC2626]",
    badge: "border-[#FCA5A5] bg-[#FEF2F2] text-[#B91C1C]",
    label: "High",
  },
  medium: {
    dot: "bg-[#D97706]",
    badge: "border-[#FCD34D] bg-[#FFFBEB] text-[#B45309]",
    label: "Medium",
  },
  low: {
    dot: "bg-[#2563EB]",
    badge: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
    label: "Low",
  },
};

const STATUS_ACCENT: Record<TaskStatus, string> = {
  todo: "#6B7280",
  in_progress: "#2563EB",
  review: "#D97706",
  done: "#16A34A",
};

const formatDue = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / 86_400_000,
  );
  const base = d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
  if (diffDays === 0) return { label: "Today", overdue: false };
  if (diffDays === 1) return { label: "Tomorrow", overdue: false };
  if (diffDays === -1) return { label: "Yesterday", overdue: true };
  return { label: base, overdue: diffDays < 0 };
};

/**
 * Parse a quick-add string into a draft task.
 * Supports: !high / !med / !low for priority, #tag for tags,
 * and the words "today" / "tomorrow" for due date.
 */
const parseQuickAdd = (raw: string) => {
  let text = raw;
  let priority: TaskPriority = "medium";
  const tags: string[] = [];
  let due_date: string | null = null;

  const prioMatch = text.match(/!(high|h|med|medium|m|low|l)\b/i);
  if (prioMatch) {
    const p = prioMatch[1].toLowerCase();
    priority = p.startsWith("h") ? "high" : p.startsWith("l") ? "low" : "medium";
    text = text.replace(prioMatch[0], "");
  }

  const tagRegex = /#([\w-]+)/g;
  let tagMatch: RegExpExecArray | null;
  while ((tagMatch = tagRegex.exec(text)) !== null) {
    tags.push(tagMatch[1]);
  }
  text = text.replace(tagRegex, "");

  if (/\btoday\b/i.test(text)) {
    const d = new Date();
    d.setHours(17, 0, 0, 0);
    due_date = d.toISOString();
    text = text.replace(/\btoday\b/i, "");
  } else if (/\btomorrow\b/i.test(text)) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(17, 0, 0, 0);
    due_date = d.toISOString();
    text = text.replace(/\btomorrow\b/i, "");
  }

  return {
    title: text.replace(/\s+/g, " ").trim(),
    priority,
    tags,
    due_date,
  };
};

const toDateInputValue = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60_000);
  return local.toISOString().slice(0, 16);
};

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

type ViewMode = "list" | "board";
type Filter = "all" | "active" | "today" | "overdue" | "done";

interface TodoClientProps {
  initialTasks: Task[];
}

export function TodoClient({ initialTasks }: TodoClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [view, setView] = useState<ViewMode>("list");
  const [filter, setFilter] = useState<Filter>("active");
  const [query, setQuery] = useState("");
  const [quickText, setQuickText] = useState("");
  const [editing, setEditing] = useState<Task | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const quickRef = useRef<HTMLInputElement>(null);

  // ---- Derived stats ----
  const stats = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    let done = 0;
    let active = 0;
    let overdue = 0;
    let dueToday = 0;
    for (const t of tasks) {
      if (t.status === "done") {
        done += 1;
        continue;
      }
      active += 1;
      if (t.due_date) {
        const d = new Date(t.due_date);
        const day = new Date(d);
        day.setHours(0, 0, 0, 0);
        if (day.getTime() < now.getTime()) overdue += 1;
        else if (day.getTime() === now.getTime()) dueToday += 1;
      }
    }
    const total = tasks.length;
    const completion = total ? Math.round((done / total) * 100) : 0;
    return { done, active, overdue, dueToday, total, completion };
  }, [tasks]);

  // ---- Filtering ----
  const visibleTasks = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const q = query.trim().toLowerCase();

    return tasks.filter((t) => {
      if (q) {
        const hay = `${t.title} ${t.description ?? ""} ${t.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      switch (filter) {
        case "active":
          return t.status !== "done";
        case "done":
          return t.status === "done";
        case "today": {
          if (!t.due_date || t.status === "done") return false;
          const d = new Date(t.due_date);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === now.getTime();
        }
        case "overdue": {
          if (!t.due_date || t.status === "done") return false;
          const d = new Date(t.due_date);
          d.setHours(0, 0, 0, 0);
          return d.getTime() < now.getTime();
        }
        default:
          return true;
      }
    });
  }, [tasks, filter, query]);

  // ---- Mutations (optimistic) ----
  const flash = (msg: string) => {
    setFeedback(msg);
    window.setTimeout(() => setFeedback(null), 2600);
  };

  const handleQuickAdd = () => {
    const draft = parseQuickAdd(quickText);
    if (!draft.title) return;

    const optimistic: Task = {
      id: `temp-${uid()}`,
      user_id: "me",
      title: draft.title,
      description: null,
      status: "todo",
      priority: draft.priority,
      due_date: draft.due_date,
      tags: draft.tags,
      subtasks: [],
      position: Date.now(),
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTasks((prev) => [optimistic, ...prev]);
    setQuickText("");
    quickRef.current?.focus();

    startTransition(async () => {
      const res = await createTask({
        title: draft.title,
        priority: draft.priority,
        tags: draft.tags,
        due_date: draft.due_date,
      });
      if (res.success && res.data) {
        setTasks((prev) =>
          prev.map((t) => (t.id === optimistic.id ? res.data! : t)),
        );
      } else {
        setTasks((prev) => prev.filter((t) => t.id !== optimistic.id));
        flash(res.message ?? "Could not add task.");
      }
    });
  };

  const handleToggle = (task: Task) => {
    const done = task.status !== "done";
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status: done ? "done" : "todo",
              completed_at: done ? new Date().toISOString() : null,
            }
          : t,
      ),
    );
    startTransition(async () => {
      const res = await toggleTask(task.id, done);
      if (res.success && res.data) {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? res.data! : t)));
      } else if (!res.success) {
        flash(res.message ?? "Update failed.");
      }
    });
  };

  const handleMove = (task: Task, status: TaskStatus) => {
    if (task.status === status) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status,
              completed_at: status === "done" ? new Date().toISOString() : null,
            }
          : t,
      ),
    );
    startTransition(async () => {
      const res = await moveTask(task.id, status);
      if (res.success && res.data) {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? res.data! : t)));
      } else if (!res.success) {
        flash(res.message ?? "Move failed.");
      }
    });
  };

  const handleDelete = (task: Task) => {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    setEditing(null);
    startTransition(async () => {
      const res = await deleteTask(task.id);
      if (!res.success) flash(res.message ?? "Delete failed.");
    });
  };

  const handleSaveEdit = (draft: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === draft.id ? draft : t)));
    setEditing(null);
    startTransition(async () => {
      const res = await updateTask(draft.id, {
        title: draft.title,
        description: draft.description,
        status: draft.status,
        priority: draft.priority,
        due_date: draft.due_date,
        tags: draft.tags,
        subtasks: draft.subtasks,
      });
      if (res.success && res.data) {
        setTasks((prev) =>
          prev.map((t) => (t.id === draft.id ? res.data! : t)),
        );
        flash("Saved.");
      } else if (!res.success) {
        flash(res.message ?? "Save failed.");
      }
    });
  };

  // ---- Render ----
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1A1A1A]">
            Tasks
          </h1>
          <p className="mt-1 text-sm leading-6 text-[#6B7280]">
            Your personal task workspace — synced to your account and remembered
            across devices.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-[#F4F6F2] p-1">
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              "inline-flex items-center gap-2 rounded-[1rem] px-4 py-2 text-sm font-medium transition",
              view === "list"
                ? "bg-white text-[#2563EB] shadow-sm"
                : "text-[#6B7280] hover:text-[#1A1A1A]",
            )}
          >
            <ListIcon className="h-4 w-4" />
            List
          </button>
          <button
            type="button"
            onClick={() => setView("board")}
            className={cn(
              "inline-flex items-center gap-2 rounded-[1rem] px-4 py-2 text-sm font-medium transition",
              view === "board"
                ? "bg-white text-[#2563EB] shadow-sm"
                : "text-[#6B7280] hover:text-[#1A1A1A]",
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Board
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active" value={stats.active} accent="#2563EB" />
        <StatCard label="Due today" value={stats.dueToday} accent="#D97706" />
        <StatCard label="Overdue" value={stats.overdue} accent="#DC2626" />
        <StatCard
          label="Completion"
          value={`${stats.completion}%`}
          accent="#16A34A"
          sub={`${stats.done} of ${stats.total} done`}
        />
      </div>

      {/* Quick add */}
      <div className="rounded-[1.5rem] border border-[#DDE7E3] bg-white p-2 shadow-card">
        <div className="flex items-center gap-2">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
            <Plus className="h-5 w-5" />
          </div>
          <Input
            ref={quickRef}
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleQuickAdd();
            }}
            placeholder="Add a task…  try:  Ship landing page !high #launch tomorrow"
            className="h-11 flex-1 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
          />
          <Button
            type="button"
            onClick={handleQuickAdd}
            disabled={!quickText.trim()}
            className="h-11 rounded-xl bg-[#2563EB] px-5 text-white hover:bg-[#1D4ED8]"
          >
            {isPending ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              "Add"
            )}
          </Button>
        </div>
        <p className="px-14 pb-1 pt-1 text-xs text-[#9CA3AF]">
          Tip: <span className="font-medium text-[#6B7280]">!high</span> sets
          priority, <span className="font-medium text-[#6B7280]">#tag</span>{" "}
          adds a tag, and{" "}
          <span className="font-medium text-[#6B7280]">today/tomorrow</span> sets
          a due date.
        </p>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ["active", "Active"],
              ["today", "Today"],
              ["overdue", "Overdue"],
              ["done", "Done"],
              ["all", "All"],
            ] as [Filter, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                filter === value
                  ? "border-[#2563EB] bg-[#2563EB] text-white"
                  : "border-[#DDE7E3] bg-white text-[#4B5563] hover:bg-[#F4F6F2]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks…"
            className="h-11 rounded-xl border-[#DDE7E3] bg-white pl-9"
          />
        </div>
      </div>

      {/* Body */}
      {view === "list" ? (
        <ListView
          tasks={visibleTasks}
          onToggle={handleToggle}
          onOpen={setEditing}
        />
      ) : (
        <BoardView
          tasks={visibleTasks}
          onToggle={handleToggle}
          onOpen={setEditing}
          onMove={handleMove}
        />
      )}

      {/* Editor */}
      <TaskEditor
        task={editing}
        onClose={() => setEditing(null)}
        onSave={handleSaveEdit}
        onDelete={handleDelete}
      />

      {/* Feedback toast */}
      {feedback ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#DDE7E3] bg-white px-5 py-3 text-sm font-medium text-[#1A1A1A] shadow-card">
          {feedback}
        </div>
      ) : null}
    </div>
  );
}

// ------------------------------------------------------------------
// Stat card
// ------------------------------------------------------------------

function StatCard({
  label,
  value,
  accent,
  sub,
}: {
  label: string;
  value: number | string;
  accent: string;
  sub?: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-[#DDE7E3] bg-white p-5 shadow-card">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: accent }}
        />
        <p className="text-sm font-medium text-[#6B7280]">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1A1A1A]">
        {value}
      </p>
      {sub ? <p className="mt-1 text-xs text-[#9CA3AF]">{sub}</p> : null}
    </div>
  );
}

// ------------------------------------------------------------------
// List view
// ------------------------------------------------------------------

function ListView({
  tasks,
  onToggle,
  onOpen,
}: {
  tasks: Task[];
  onToggle: (t: Task) => void;
  onOpen: (t: Task) => void;
}) {
  if (tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          onToggle={onToggle}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onOpen,
}: {
  task: Task;
  onToggle: (t: Task) => void;
  onOpen: (t: Task) => void;
}) {
  const done = task.status === "done";
  const due = formatDue(task.due_date);
  const prio = PRIORITY_STYLES[task.priority];
  const subDone = task.subtasks.filter((s) => s.done).length;

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-[1.25rem] border border-[#DDE7E3] bg-white px-4 py-3 shadow-card transition hover:border-[#C7D2CC]",
        done && "opacity-60",
      )}
    >
      <button
        type="button"
        onClick={() => onToggle(task)}
        className="shrink-0 text-[#9CA3AF] transition hover:text-[#16A34A]"
        aria-label={done ? "Mark as not done" : "Mark as done"}
      >
        {done ? (
          <CheckCircle2 className="h-6 w-6 text-[#16A34A]" />
        ) : (
          <Circle className="h-6 w-6" />
        )}
      </button>

      <button
        type="button"
        onClick={() => onOpen(task)}
        className="min-w-0 flex-1 text-left"
      >
        <p
          className={cn(
            "truncate text-sm font-medium text-[#1A1A1A]",
            done && "line-through",
          )}
        >
          {task.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#9CA3AF]">
          <span className="inline-flex items-center gap-1">
            <span className={cn("h-2 w-2 rounded-full", prio.dot)} />
            {prio.label}
          </span>
          {due ? (
            <span
              className={cn(
                "inline-flex items-center gap-1",
                due.overdue && !done && "font-medium text-[#DC2626]",
              )}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              {due.label}
            </span>
          ) : null}
          {task.subtasks.length > 0 ? (
            <span>
              {subDone}/{task.subtasks.length} subtasks
            </span>
          ) : null}
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-[#F4F6F2] px-2 py-0.5 text-[#6B7280]"
            >
              <TagIcon className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      </button>

      <Badge
        variant="outline"
        className="shrink-0 border-[#DDE7E3] text-[#6B7280]"
        style={{ color: STATUS_ACCENT[task.status] }}
      >
        {TASK_STATUS_LABELS[task.status]}
      </Badge>
    </div>
  );
}

// ------------------------------------------------------------------
// Board (Kanban) view
// ------------------------------------------------------------------

function BoardView({
  tasks,
  onToggle,
  onOpen,
  onMove,
}: {
  tasks: Task[];
  onToggle: (t: Task) => void;
  onOpen: (t: Task) => void;
  onMove: (t: Task, status: TaskStatus) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);

  const byStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {TASK_STATUSES.map((status) => {
        const column = byStatus(status);
        return (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragId) {
                const task = tasks.find((t) => t.id === dragId);
                if (task) onMove(task, status);
                setDragId(null);
              }
            }}
            className="flex flex-col rounded-[1.5rem] border border-[#DDE7E3] bg-[#FAFAF8] p-3"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: STATUS_ACCENT[status] }}
                />
                <p className="text-sm font-semibold text-[#1A1A1A]">
                  {TASK_STATUS_LABELS[status]}
                </p>
              </div>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-[#6B7280]">
                {column.length}
              </span>
            </div>

            <div className="flex-1 space-y-2">
              {column.map((task) => (
                <BoardCard
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onOpen={onOpen}
                  onDragStart={() => setDragId(task.id)}
                  onDragEnd={() => setDragId(null)}
                />
              ))}
              {column.length === 0 ? (
                <div className="rounded-[1.25rem] border border-dashed border-[#DDE7E3] py-8 text-center text-xs text-[#9CA3AF]">
                  Drop tasks here
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BoardCard({
  task,
  onToggle,
  onOpen,
  onDragStart,
  onDragEnd,
}: {
  task: Task;
  onToggle: (t: Task) => void;
  onOpen: (t: Task) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const due = formatDue(task.due_date);
  const prio = PRIORITY_STYLES[task.priority];
  const done = task.status === "done";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="cursor-grab rounded-[1.25rem] border border-[#DDE7E3] bg-white p-3 shadow-card transition hover:border-[#C7D2CC] active:cursor-grabbing"
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => onToggle(task)}
          className="mt-0.5 shrink-0 text-[#9CA3AF] transition hover:text-[#16A34A]"
        >
          {done ? (
            <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onOpen(task)}
          className="min-w-0 flex-1 text-left"
        >
          <p
            className={cn(
              "text-sm font-medium text-[#1A1A1A]",
              done && "line-through opacity-60",
            )}
          >
            {task.title}
          </p>
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 pl-7 text-xs text-[#9CA3AF]">
        <span className={cn("rounded-full border px-2 py-0.5", prio.badge)}>
          {prio.label}
        </span>
        {due ? (
          <span
            className={cn(
              "inline-flex items-center gap-1",
              due.overdue && !done && "font-medium text-[#DC2626]",
            )}
          >
            <CalendarClock className="h-3.5 w-3.5" />
            {due.label}
          </span>
        ) : null}
        {task.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="rounded-full bg-[#F4F6F2] px-2 py-0.5">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Empty state
// ------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-[#DDE7E3] bg-white py-16 text-center shadow-card">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <p className="mt-4 text-base font-semibold text-[#1A1A1A]">
        Nothing here yet
      </p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-[#6B7280]">
        Add your first task using the bar above. Your tasks are saved to your
        account and will be here when you come back.
      </p>
    </div>
  );
}

// ------------------------------------------------------------------
// Task editor (Sheet)
// ------------------------------------------------------------------

function TaskEditor({
  task,
  onClose,
  onSave,
  onDelete,
}: {
  task: Task | null;
  onClose: () => void;
  onSave: (t: Task) => void;
  onDelete: (t: Task) => void;
}) {
  const [draft, setDraft] = useState<Task | null>(task);
  const [newSub, setNewSub] = useState("");
  const [newTag, setNewTag] = useState("");

  // Sync local draft whenever a different task is opened.
  if (task && (!draft || draft.id !== task.id)) {
    setDraft(task);
  }
  if (!task && draft) {
    setDraft(null);
  }

  if (!draft) {
    return (
      <Sheet open={false} onOpenChange={() => onClose()}>
        <SheetContent />
      </Sheet>
    );
  }

  const update = (patch: Partial<Task>) =>
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));

  const addSubtask = () => {
    const title = newSub.trim();
    if (!title) return;
    const sub: Subtask = { id: uid(), title, done: false };
    update({ subtasks: [...draft.subtasks, sub] });
    setNewSub("");
  };

  const toggleSub = (id: string) =>
    update({
      subtasks: draft.subtasks.map((s) =>
        s.id === id ? { ...s, done: !s.done } : s,
      ),
    });

  const removeSub = (id: string) =>
    update({ subtasks: draft.subtasks.filter((s) => s.id !== id) });

  const addTag = () => {
    const tag = newTag.trim().replace(/^#/, "");
    if (!tag || draft.tags.includes(tag)) {
      setNewTag("");
      return;
    }
    update({ tags: [...draft.tags, tag] });
    setNewTag("");
  };

  const removeTag = (tag: string) =>
    update({ tags: draft.tags.filter((t) => t !== tag) });

  return (
    <Sheet open={Boolean(task)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="space-y-1 text-left">
          <SheetTitle className="text-lg">Edit task</SheetTitle>
          <SheetDescription>
            Changes save to your account when you click Save.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#1A1A1A]">Title</Label>
            <Input
              value={draft.title}
              onChange={(e) => update({ title: e.target.value })}
              className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#1A1A1A]">Notes</Label>
            <Textarea
              value={draft.description ?? ""}
              onChange={(e) => update({ description: e.target.value })}
              rows={3}
              placeholder="Add details…"
              className="rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#1A1A1A]">
                Status
              </Label>
              <Select
                value={draft.status}
                onValueChange={(v) => update({ status: v as TaskStatus })}
              >
                <SelectTrigger className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {TASK_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#1A1A1A]">
                Priority
              </Label>
              <Select
                value={draft.priority}
                onValueChange={(v) => update({ priority: v as TaskPriority })}
              >
                <SelectTrigger className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {TASK_PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#1A1A1A]">
              Due date
            </Label>
            <Input
              type="datetime-local"
              value={toDateInputValue(draft.due_date)}
              onChange={(e) =>
                update({
                  due_date: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null,
                })
              }
              className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#1A1A1A]">Tags</Label>
            <div className="flex flex-wrap gap-2">
              {draft.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-[#F4F6F2] px-3 py-1 text-xs font-medium text-[#4B5563]"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-[#9CA3AF] hover:text-[#DC2626]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag…"
                className="h-10 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                className="h-10 rounded-xl border-[#DDE7E3] bg-white"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Subtasks */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#1A1A1A]">
              Subtasks
            </Label>
            <div className="space-y-1.5">
              {draft.subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-2 rounded-xl border border-[#DDE7E3] bg-[#FAFAF8] px-3 py-2"
                >
                  <button
                    type="button"
                    onClick={() => toggleSub(sub.id)}
                    className="text-[#9CA3AF] transition hover:text-[#16A34A]"
                  >
                    {sub.done ? (
                      <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </button>
                  <span
                    className={cn(
                      "flex-1 text-sm text-[#1A1A1A]",
                      sub.done && "text-[#9CA3AF] line-through",
                    )}
                  >
                    {sub.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSub(sub.id)}
                    className="text-[#9CA3AF] hover:text-[#DC2626]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSub}
                onChange={(e) => setNewSub(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSubtask();
                  }
                }}
                placeholder="Add a subtask…"
                className="h-10 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addSubtask}
                className="h-10 rounded-xl border-[#DDE7E3] bg-white"
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-8 flex-row gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onDelete(draft)}
            className="h-11 rounded-xl border-[#F3C5C5] bg-white text-[#B42318] hover:bg-[#FFF5F5]"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button
            type="button"
            onClick={() => onSave(draft)}
            disabled={!draft.title.trim()}
            className="h-11 flex-1 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
          >
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
