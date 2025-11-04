import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { quizRequestSchema, insertHighScoreSchema } from "@shared/schema";
import { sendDailyQuizToSubscriber, sendDailyQuizToAllSubscribers } from "./email-service";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/questions", async (req, res) => {
    try {
      const mode = (req.query.mode as "practice" | "exam" | "scenario") || "practice";
      const count = parseInt(req.query.count as string) || 5;

      const questions = await storage.getQuestionsByMode(mode, count);
      res.json(questions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/adverts/random", async (req, res) => {
    try {
      const advert = await storage.getRandomAdvert();
      res.json(advert);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // INTERNAL USE ONLY: Send daily quiz to a specific subscriber
  // This endpoint requires authentication and should only be called by scheduled jobs
  app.post("/api/send-daily-quiz", async (req, res) => {
    try {
      // Verify internal API key for security
      const apiKey = req.headers['x-api-key'] as string;
      const validApiKey = process.env.INTERNAL_API_KEY || 'dev-test-key-only';
      
      if (!apiKey || apiKey !== validApiKey) {
        return res.status(403).json({ error: "Unauthorized: Invalid API key" });
      }

      const emailSchema = z.object({
        email: z.string().email("Invalid email address"),
      });

      const { email } = emailSchema.parse(req.body);
      
      await sendDailyQuizToSubscriber(email);
      res.json({ 
        success: true, 
        message: `Daily quiz sent to ${email}` 
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // INTERNAL USE ONLY: Send daily quiz to all subscribers
  // This endpoint requires authentication and should only be called by scheduled jobs
  app.post("/api/send-daily-quiz-all", async (req, res) => {
    try {
      // Verify internal API key for security
      const apiKey = req.headers['x-api-key'] as string;
      const validApiKey = process.env.INTERNAL_API_KEY || 'dev-test-key-only';
      
      if (!apiKey || apiKey !== validApiKey) {
        return res.status(403).json({ error: "Unauthorized: Invalid API key" });
      }

      const result = await sendDailyQuizToAllSubscribers();
      res.json({ 
        success: true, 
        ...result 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get subscription status
  app.get("/api/subscription-status", async (req, res) => {
    try {
      const email = req.query.email as string;
      
      if (!email) {
        return res.status(400).json({ error: "Email parameter required" });
      }

      const subscription = await storage.getEmailSubscription(email);
      if (!subscription) {
        return res.json({ subscribed: false });
      }

      res.json({
        subscribed: true,
        isActive: subscription.isActive === 1,
        daysSent: subscription.daysSent,
        subscribedAt: subscription.subscribedAt,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DEVELOPMENT ONLY: Direct email subscription for testing
  app.post("/api/dev-subscribe-email", async (req, res) => {
    try {
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: "Not available in production" });
      }

      const emailSchema = z.object({
        email: z.string().email("Invalid email address"),
      });

      const { email } = emailSchema.parse(req.body);
      
      const subscription = await storage.subscribeEmail(email);
      res.json({ 
        success: true, 
        message: "Development test subscription created",
        subscription 
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Save high score to weekly leaderboard
  app.post("/api/high-scores", async (req, res) => {
    try {
      const highScore = insertHighScoreSchema.parse(req.body);
      
      // Validate mode is exam or scenario only
      if (highScore.mode !== "exam" && highScore.mode !== "scenario") {
        return res.status(400).json({ error: "High scores only available for exam and scenario modes" });
      }
      
      const savedScore = await storage.saveHighScore(highScore);
      res.json(savedScore);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Get weekly high scores
  app.get("/api/high-scores", async (req, res) => {
    try {
      const mode = req.query.mode as "exam" | "scenario";
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!mode || (mode !== "exam" && mode !== "scenario")) {
        return res.status(400).json({ error: "Mode parameter required (exam or scenario)" });
      }
      
      const highScores = await storage.getWeeklyHighScores(mode, limit);
      res.json(highScores);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all-time high score
  app.get("/api/all-time-high-score", async (req, res) => {
    try {
      const mode = req.query.mode as "exam" | "scenario";
      
      if (!mode || (mode !== "exam" && mode !== "scenario")) {
        return res.status(400).json({ error: "Mode parameter required (exam or scenario)" });
      }
      
      const allTimeHigh = await storage.getAllTimeHighScore(mode);
      res.json(allTimeHigh);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
