"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { CheckIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";

export default function TaskExample() {
  const tasks = useQuery(api.tasks.getAllTasks);
  const setTaskCompleted = useMutation(api.tasks.setTaskCompleted);
  const addTask = useMutation(api.tasks.addTask);
  const deleteTask = useMutation(api.tasks.deleteTask);
  const [newTaskText, setNewTaskText] = useState("");

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
      await addTask({ text: newTaskText.trim() });
      setNewTaskText(""); // Clear the input after adding
    } catch (error) {
      console.error("Error adding task:", error);
    }
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
      <h2 className="mb-4 font-semibold text-xl">Tasks</h2>
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
                <span className={isCompleted ? "line-through text-muted-foreground" : ""}>
                  {text}
                </span>
                <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleCompleteTask(_id, !isCompleted)}
                  className={isCompleted ? "bg-green-100 text-green-600" : ""}
                >
                  <CheckIcon className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleDeleteTask(_id)}
                >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">Loading tasks...</p>
      )}
      <form className="flex gap-2 mt-4" onSubmit={handleAddTask}>
        <Input 
          type="text" 
          placeholder="Task" 
          className="flex-1 h-12"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
        />
        <Button type="submit" className="h-12">
          Add Task
          <PlusIcon className="ml-2 w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}