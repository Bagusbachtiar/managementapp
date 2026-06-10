import { prisma } from "@/lib/prisma";
import { TasksClient } from "./TasksClient";

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Tugas</h1>
      <TasksClient tasks={tasks} />
    </div>
  );
}
