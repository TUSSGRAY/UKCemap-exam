import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Question schema
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topic: text("topic").notNull(),
  question: text("question").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  answer: text("answer").notNull(), // A, B, C, or D
  scenario: text("scenario"), // Optional scenario context for scenario-based questions
  scenarioId: text("scenario_id"), // Groups questions that share the same scenario
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

// Quiz mode type
export const quizModeSchema = z.enum(["practice", "exam", "scenario"]);
export type QuizMode = z.infer<typeof quizModeSchema>;

// Quiz request schema
export const quizRequestSchema = z.object({
  mode: quizModeSchema,
  questionCount: z.number().min(1).max(100).optional(),
});

export type QuizRequest = z.infer<typeof quizRequestSchema>;

// Quiz session schema
export const quizSessionSchema = z.object({
  mode: quizModeSchema,
  questions: z.array(z.any()), // Array of Question type
  currentIndex: z.number(),
  answers: z.record(z.string()), // question id -> answer
  score: z.number().optional(),
});

export type QuizSession = z.infer<typeof quizSessionSchema>;

// Advert schema
export const advertSchema = z.object({
  id: z.string(),
  message: z.string(),
});

export type Advert = z.infer<typeof advertSchema>;
