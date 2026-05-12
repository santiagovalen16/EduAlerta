import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const createAlertSchema = z.object({
  studentId: z.string().uuid(),
  clientGeneratedId: z.string().uuid(),
  type: z.enum(["ATTENDANCE", "ACADEMIC", "BEHAVIOR", "FAMILY"]),
  description: z.string().min(12).max(800)
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateAlertInput = z.infer<typeof createAlertSchema>;
