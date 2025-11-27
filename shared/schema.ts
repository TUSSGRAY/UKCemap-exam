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
export const quizModeSchema = z.enum(["practice", "exam", "scenario", "topic-exam"]);
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

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// High score schema for weekly leaderboard
export const highScores = pgTable("high_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  mode: text("mode").notNull(), // "exam", "scenario", or "topic:collective-investments"
  timestamp: text("timestamp").notNull(),
});

export const insertHighScoreSchema = createInsertSchema(highScores).omit({
  id: true,
  timestamp: true,
});

export type InsertHighScore = z.infer<typeof insertHighScoreSchema>;
export type HighScore = typeof highScores.$inferSelect;

// Payment schemas
export const paymentProductSchema = z.enum(["subscription"]);
export type PaymentProduct = z.infer<typeof paymentProductSchema>;

export const createPaymentIntentSchema = z.object({
  product: paymentProductSchema,
});

export type CreatePaymentIntent = z.infer<typeof createPaymentIntentSchema>;

export const verifyPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
});

export type VerifyPayment = z.infer<typeof verifyPaymentSchema>;

// Access tokens table for exam/scenario/bundle purchases
export const accessTokens = pgTable("access_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  token: text("token").notNull().unique(),
  paymentIntentId: text("payment_intent_id").notNull().unique(),
  product: text("product").notNull(), // "exam", "scenario", or "bundle"
  userId: varchar("user_id").references(() => users.id), // Link to user account
  expiresAt: text("expires_at"), // For bundle: 30 days from purchase, null for exam/scenario (lifetime)
  createdAt: text("created_at").notNull(),
});

export const insertAccessTokenSchema = createInsertSchema(accessTokens).omit({
  id: true,
  createdAt: true,
});

export type InsertAccessToken = z.infer<typeof insertAccessTokenSchema>;
export type AccessToken = typeof accessTokens.$inferSelect;

// Authentication schemas
export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
