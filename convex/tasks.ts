import { v } from "convex/values";
import { query, mutation } from './_generated/server';

// A Convex query function
export const getAllOpenTasks = query({
    args: {},
    handler: async (ctx, args) => {
      // Query the database to get all items that are not completed
      const tasks = await ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("isCompleted"), false))
        .collect();
      return tasks;
    },
  });

// A Convex query function to get all tasks
export const getAllTasks = query({
    args: {},
    handler: async (ctx, args) => {
      const tasks = await ctx.db.query("tasks").collect();
      return tasks;
    },
  });

// A Convex mutation function to complete a task
export const setTaskCompleted = mutation({
  args: { taskId: v.id("tasks"), completed: v.boolean() },
  handler: async (ctx, { taskId, completed }) => {
    // Update the database using TypeScript
    await ctx.db.patch(taskId, { isCompleted: completed });
  },
});

// A Convex mutation function to add a new task
export const addTask = mutation({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    // Insert a new task into the database
    const taskId = await ctx.db.insert("tasks", {
      text: text,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    });
    return taskId;
  },
});

//delete a task
export const deleteTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, { taskId }) => {
    await ctx.db.delete(taskId);
  },
});