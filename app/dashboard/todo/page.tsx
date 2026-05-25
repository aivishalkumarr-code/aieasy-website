import { getTasks } from "@/app/dashboard/actions/tasks";
import { TodoClient } from "@/app/dashboard/todo/TodoClient";

export const metadata = {
  title: "Tasks · AIeasy",
};

export default async function TodoPage() {
  const tasks = await getTasks();

  return <TodoClient initialTasks={tasks} />;
}
