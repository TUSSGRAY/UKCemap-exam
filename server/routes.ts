import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { quizRequestSchema, insertHighScoreSchema, createPaymentIntentSchema, verifyPaymentSchema } from "@shared/schema";
import { sendDailyQuizToSubscriber, sendDailyQuizToAllSubscribers } from "./email-service";
import { z } from "zod";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-10-29.clover",
});

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

  // Create Stripe payment intent
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { product } = createPaymentIntentSchema.parse(req.body);
      
      // Determine amount based on product (in pence)
      let amount: number;
      let description: string;
      
      switch (product) {
        case "exam":
          amount = 99; // £0.99
          description = "Full Exam Mode Access";
          break;
        case "scenario":
          amount = 99; // £0.99
          description = "Scenario Quiz Mode Access";
          break;
        case "bundle":
          amount = 149; // £1.49
          description = "Bundle: Full Exam + Scenario Quiz Access";
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
  app.post("/api/verify-payment", async (req, res) => {
    try {
      // SECURITY: Validate input to prevent DoS from malformed requests
      const { paymentIntentId, email } = verifyPaymentSchema.parse(req.body);
      
      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ error: "Payment not successful" });
      }

      // SECURITY: Only trust the product from Stripe metadata, ignore client input
      const product = paymentIntent.metadata?.product;
      if (!product || !["exam", "scenario", "bundle"].includes(product)) {
        return res.status(400).json({ error: "Invalid payment: missing or invalid product metadata" });
      }

      // SECURITY: Validate amount and currency match expected values
      const expectedAmounts = {
        exam: 99,
        scenario: 99,
        bundle: 149,
      };

      const expectedAmount = expectedAmounts[product as keyof typeof expectedAmounts];
      if (paymentIntent.amount !== expectedAmount || paymentIntent.currency !== "gbp") {
        return res.status(400).json({ 
          error: "Payment amount mismatch" 
        });
      }
      
      // Generate access token(s) based on verified product (from Stripe only)
      let accessToken: string;
      
      switch (product) {
        case "exam":
          accessToken = await storage.recordExamPurchase(paymentIntentId);
          break;
        case "scenario":
          accessToken = await storage.recordScenarioPurchase(paymentIntentId);
          break;
        case "bundle":
          accessToken = await storage.recordBundlePurchase(paymentIntentId);
          
          // If email provided for bundle, subscribe to 100 Days campaign
          if (email) {
            try {
              // Check if payment intent already used for subscription
              const alreadyUsed = await storage.isPaymentIntentUsedForSubscription(paymentIntentId);
              
              if (!alreadyUsed) {
                await storage.subscribeEmail(email);
                await storage.markPaymentIntentUsedForSubscription(paymentIntentId);
              }
            } catch (emailError: any) {
              // Don't fail the whole payment if email subscription fails
              console.error("Email subscription error:", emailError);
            }
          }
          break;
        default:
          return res.status(400).json({ error: "Invalid product" });
      }
      
      res.json({ 
        success: true, 
        accessToken,
        product, // Return the verified product from Stripe metadata
        message: "Payment verified successfully" 
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Error verifying payment: " + error.message });
    }
  });

  // SECURITY: Check exam access - accepts token in POST body, not URL
  app.post("/api/check-exam-access", async (req, res) => {
    try {
      const { accessToken } = req.body;
      
      if (!accessToken || typeof accessToken !== "string") {
        return res.json({ hasAccess: false });
      }
      
      const hasAccess = await storage.checkExamAccess(accessToken);
      res.json({ hasAccess });
    } catch (error: any) {
      res.status(500).json({ error: "Access check failed" });
    }
  });

  // SECURITY: Check scenario access - accepts token in POST body, not URL
  app.post("/api/check-scenario-access", async (req, res) => {
    try {
      const { accessToken } = req.body;
      
      if (!accessToken || typeof accessToken !== "string") {
        return res.json({ hasAccess: false });
      }
      
      const hasAccess = await storage.checkScenarioAccess(accessToken);
      res.json({ hasAccess });
    } catch (error: any) {
      res.status(500).json({ error: "Access check failed" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
