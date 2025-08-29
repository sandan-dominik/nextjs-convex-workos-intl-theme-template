"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { CheckIcon, Loader2, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { Skeleton } from "./ui/skeleton";
import { useTranslations } from "next-intl";

export default function TaskExample() {
  const t = useTranslations("components.TaskExample");
  const tasks = useQuery(api.tasks.getAllTasks);
  const setTaskCompleted = useMutation(api.tasks.setTaskCompleted);
  const addTask = useMutation(api.tasks.addTask);
  const deleteTask = useMutation(api.tasks.deleteTask);
  const [newTaskText, setNewTaskText] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);

  const handleCompleteTask = async (taskId: Id<"tasks">, completed: boolean) => {
    try {
      await setTaskCompleted({ taskId: taskId as Id<"tasks">, completed });
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    try {
      setCreatingTask(true);
      await addTask({ text: newTaskText.trim() });
      setNewTaskText(""); // Clear the input after adding
    } catch (error) {
      console.error("Error adding task:", error);
    }
    setCreatingTask(false);
  };

  const handleDeleteTask = async (taskId: Id<"tasks">) => {
    try {
      await deleteTask({ taskId });
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <h2 className="flex justify-between items-center mb-4 font-semibold text-xl">{t("title")} {!tasks && <Loader2 className="w-4 h-4 animate-spin" />}</h2>
      {tasks ? (
        <ul className="space-y-2">
          {[...tasks]
            .sort((a, b) => {
              if (a.isCompleted === b.isCompleted) return 0;
              return a.isCompleted ? 1 : -1;
            })
            .map(({ _id, text, isCompleted }) => (
              <li 
                key={_id}
                  className="flex justify-between items-center bg-card p-3 border rounded-lg"
              >
                <span className={isCompleted ? "line-through text-green-600/80" : ""}>
                  {text}
                </span>
                <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleCompleteTask(_id, !isCompleted)}
                  className={isCompleted ? "bg-green-100 text-green-600 cursor-pointer hover:bg-green-200 hover:text-green-700" : "cursor-pointer hover:bg-green-100 hover:text-green-600"}
                >
                  <CheckIcon className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleDeleteTask(_id)}
                  className="hover:bg-red-100 hover:text-red-600 cursor-pointer"
                >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : (
        <div className="space-y-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
        </div>
      )}
      <form className="flex gap-2 mt-4" onSubmit={handleAddTask}>
        <Input 
          type="text" 
          className="flex-1 h-12"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
        />
        <Button type="submit" className="h-12 cursor-pointer" disabled={creatingTask}>
          {creatingTask ? <>{t("addTask")}<Loader2 className="w-4 h-4 animate-spin" /></> : (
            <>
              {t("addTask")}
              <PlusIcon className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}