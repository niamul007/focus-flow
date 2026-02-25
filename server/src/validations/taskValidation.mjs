import {z} from 'zod'

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title is too long"),
    description: z.string().max(500).optional(), 
    // Status usually defaults to 'pending' in the DB, so it can be optional here
    status: z.enum(["todo", "in-progress", "completed"]).optional(),
  })
});