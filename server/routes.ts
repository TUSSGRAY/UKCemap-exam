import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  quizRequestSchema, 
  insertHighScoreSchema, 
  createPaymentIntentSchema, 
  verifyPaymentSchema,
  registerSchema,
  loginSchema
} from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";

// Initialize Stripe only if the secret key is available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover",
    })
  : null;

// Auth middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

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

  app.get("/api/topics", async (req, res) => {
    try {
      const allQuestions = await storage.getAllQuestions();
      const topics = Array.from(new Set(allQuestions.map(q => q.topic)));
      res.json(topics.sort());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/questions/topic", async (req, res) => {
    try {
      const topic = req.query.topic as string;
      const count = Math.min(parseInt(req.query.count as string) || 50, 50);

      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const questions = await storage.getQuestionsByTopic(topic, count);
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

  // Authentication endpoints
  app.post("/api/register", async (req, res) => {
    try {
      const { password, ...rest } = registerSchema.parse(req.body);
      
      // Storage expects passwordHash field (even though it contains raw password)
      const user = await storage.createUser({
        ...rest,
        passwordHash: password,
      });
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password hash
      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      if (error.message.includes("already exists")) {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: "Error creating user: " + error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      
      const user = await storage.verifyPassword(credentials.email, credentials.password);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password hash
      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Error logging in: " + error.message });
    }
  });

  app.post("/api/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "Error logging out" });
        }
        res.json({ success: true, message: "Logged out successfully" });
      });
    } catch (error: any) {
      res.status(500).json({ error: "Error logging out: " + error.message });
    }
  });

  app.get("/api/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUserById(req.session.userId!);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Return user without password hash
      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ error: "Error fetching user: " + error.message });
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

  // Create Stripe payment intent
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { product } = createPaymentIntentSchema.parse(req.body);
      
      // Determine amount based on product (in pence)
      let amount: number;
      let description: string;
      
      switch (product) {
        case "subscription":
          amount = 499; // £4.99
          description = "CeMAP Exam Training - 30 Days Premium Access";
          break;
        default:
          return res.status(400).json({ error: "Invalid product" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "gbp",
        description,
        metadata: {
          product,
        },
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Error creating payment intent: " + error.message });
    }
  });

  // Verify payment and generate access token
  app.post("/api/verify-payment", requireAuth, async (req, res) => {
    try {
      // SECURITY: Validate input to prevent DoS from malformed requests
      const { paymentIntentId } = verifyPaymentSchema.parse(req.body);
      
      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ error: "Payment not successful" });
      }

      // SECURITY: Only trust the product from Stripe metadata, ignore client input
      const product = paymentIntent.metadata?.product;
      if (!product || !["subscription"].includes(product)) {
        return res.status(400).json({ error: "Invalid payment: missing or invalid product metadata" });
      }

      // SECURITY: Validate amount and currency match expected values
      const expectedAmounts = {
        subscription: 499,
      };

      const expectedAmount = expectedAmounts[product as keyof typeof expectedAmounts];
      if (paymentIntent.amount !== expectedAmount || paymentIntent.currency !== "gbp") {
        return res.status(400).json({ 
          error: "Payment amount mismatch" 
        });
      }
      
      // Get user ID from session
      const userId = req.session.userId!;
      
      // Generate access token for subscription (30-day access to both exam and scenario modes)
      let accessToken: string;
      
      switch (product) {
        case "subscription":
          accessToken = await storage.recordBundlePurchase(paymentIntentId, userId);
          break;
        default:
          return res.status(400).json({ error: "Invalid product" });
      }
      
      res.json({ 
        success: true, 
        accessToken,
        product,
        message: "Payment verified successfully" 
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Error verifying payment: " + error.message });
    }
  });

  // Check exam access
  app.get("/api/check-exam-access", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const hasAccess = await storage.checkExamAccess(userId);
      res.json({ hasAccess });
    } catch (error: any) {
      res.status(500).json({ error: "Access check failed" });
    }
  });

  // Check scenario access
  app.get("/api/check-scenario-access", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const hasAccess = await storage.checkScenarioAccess(userId);
      res.json({ hasAccess });
    } catch (error: any) {
      res.status(500).json({ error: "Access check failed" });
    }
  });

  // Get user profile with access tokens
  app.get("/api/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const tokens = await storage.getUserAccessTokens(userId);
      
      // Format tokens with product and expiration info
      const formattedTokens = tokens.map(token => ({
        id: token.id,
        product: token.product,
        expiresAt: token.expiresAt,
        createdAt: token.createdAt,
      }));
      
      res.json({ tokens: formattedTokens });
    } catch (error: any) {
      res.status(500).json({ error: "Error fetching profile: " + error.message });
    }
  });

  // Delete user account
  app.delete("/api/delete-account", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      await storage.deleteUser(userId);
      
      // Clear session
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "Error deleting account" });
        }
        res.json({ success: true, message: "Account deleted successfully" });
      });
    } catch (error: any) {
      res.status(500).json({ error: "Error deleting account: " + error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
