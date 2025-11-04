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

// Email subscription schema for 100 Days campaign
export const emailSubscriptions = pgTable("email_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  subscribedAt: text("subscribed_at").notNull(),
  isActive: integer("is_active").notNull().default(1), // 1 = active, 0 = unsubscribed
  daysSent: integer("days_sent").notNull().default(0), // Track how many days have been sent (max 100)
});

export const insertEmailSubscriptionSchema = createInsertSchema(emailSubscriptions).omit({
  id: true,
});

export type InsertEmailSubscription = z.infer<typeof insertEmailSubscriptionSchema>;
export type EmailSubscription = typeof emailSubscriptions.$inferSelect;

// High score schema for weekly leaderboard
export const highScores = pgTable("high_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  mode: text("mode").notNull(), // "exam" or "scenario"
  timestamp: text("timestamp").notNull(),
});

export const insertHighScoreSchema = createInsertSchema(highScores).omit({
  id: true,
  timestamp: true,
});

export type InsertHighScore = z.infer<typeof insertHighScoreSchema>;
export type HighScore = typeof highScores.$inferSelect;
