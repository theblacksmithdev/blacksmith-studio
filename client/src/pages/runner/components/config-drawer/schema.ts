import { z } from "zod";

export const envEntrySchema = z.object({
  key: z.string(),
  value: z.string(),
});

export const runnerConfigSchema = z.object({
  name: z.string().min(1, "Name is required"),
  command: z.string().min(1, "Command is required"),
  setupCommand: z.string().optional(),
  cwd: z.string(),
  port: z.string().optional(),
  readyPattern: z.string().optional(),
  previewUrl: z.string().optional(),
  icon: z.string(),
  env: z.array(envEntrySchema),
});

export type RunnerConfigFormData = z.infer<typeof runnerConfigSchema>;
export type EnvEntry = z.infer<typeof envEntrySchema>;
