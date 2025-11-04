import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { quizRequestSchema } from "@shared/schema";
import Stripe from "stripe";
import { sendDailyQuizToSubscriber, sendDailyQuizToAllSubscribers } from "./email-service";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
if (process.env.NODE_ENV === 'production' && !process.env.INTERNAL_API_KEY) {
  throw new Error('INTERNAL_API_KEY must be set in production for email endpoint security. Generate a secure random string and add it to secrets.');
}
if (!process.env.INTERNAL_API_KEY) {
  console.warn('WARNING: INTERNAL_API_KEY not set. Using development-only key. This is NOT secure for production!');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-10-29.clover",
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/questions", async (req, res) => {
    try {
      const mode = (req.query.mode as "practice" | "exam" | "scenario") || "practice";
      const count = parseInt(req.query.count as string) || 5;

      // Enforce access control for exam mode
      if (mode === "exam") {
        const accessToken = req.headers['x-access-token'] as string;
        
        if (!accessToken) {
          return res.status(403).json({ error: "Exam mode requires payment. Access token missing." });
        }
        
        const hasAccess = await storage.checkExamAccess(accessToken);
        if (!hasAccess) {
          return res.status(403).json({ error: "Invalid or expired access token. Please purchase exam access." });
        }
      }

      // Enforce access control for scenario mode
      if (mode === "scenario") {
        const accessToken = req.headers['x-access-token'] as string;
        
        if (!accessToken) {
          return res.status(403).json({ error: "Scenario quiz requires payment. Access token missing." });
        }
        
        const hasAccess = await storage.checkScenarioAccess(accessToken);
        if (!hasAccess) {
          return res.status(403).json({ error: "Invalid or expired access token. Please purchase scenario quiz access." });
        }
      }

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

  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { purchaseType } = req.body;
      
      // Hardcode prices on server - never trust client input for amounts or email
      let amount: number;
      let productName: string;
      
      switch (purchaseType) {
        case "exam":
          amount = 99; // £0.99
          productName = "cemap_full_exam";
          break;
        case "scenario":
          amount = 99; // £0.99
          productName = "cemap_scenario_quiz";
          break;
        case "bundle":
          amount = 149; // £1.49
          productName = "cemap_bundle";
          break;
        default:
          return res.status(400).json({ error: "Invalid purchase type" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "gbp",
        // Explicitly specify card as the only payment method (no automatic methods)
        // This prevents redirect-based payment methods in iframe environments
        payment_method_types: ["card"],
        metadata: {
          product: productName,
          purchaseType
        }
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post("/api/verify-payment", async (req, res) => {
    try {
      const { paymentIntentId } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({ error: "Payment intent ID required" });
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== "succeeded") {
        return res.json({ verified: false, hasAccess: false });
      }

      const purchaseType = paymentIntent.metadata.purchaseType;
      let accessToken: string;
      let expectedAmount: number;

      switch (purchaseType) {
        case "exam":
          expectedAmount = 99;
          if (paymentIntent.amount === expectedAmount) {
            accessToken = await storage.recordExamPurchase(paymentIntentId);
            res.json({ verified: true, purchaseType: "exam", accessToken });
          } else {
            res.json({ verified: false, hasAccess: false });
          }
          break;
        case "scenario":
          expectedAmount = 99;
          if (paymentIntent.amount === expectedAmount) {
            accessToken = await storage.recordScenarioPurchase(paymentIntentId);
            res.json({ verified: true, purchaseType: "scenario", accessToken });
          } else {
            res.json({ verified: false, hasAccess: false });
          }
          break;
        case "bundle":
          expectedAmount = 149;
          if (paymentIntent.amount === expectedAmount) {
            accessToken = await storage.recordBundlePurchase(paymentIntentId);
            res.json({ verified: true, purchaseType: "bundle", accessToken });
          } else {
            res.json({ verified: false, hasAccess: false });
          }
          break;
        default:
          res.status(400).json({ error: "Invalid purchase type" });
      }
    } catch (error: any) {
      res.status(500).json({ message: "Error verifying payment: " + error.message });
    }
  });

  app.get("/api/check-exam-access", async (req, res) => {
    try {
      const accessToken = req.headers['x-access-token'] as string;
      
      if (!accessToken) {
        return res.json({ hasAccess: false });
      }
      
      const hasAccess = await storage.checkExamAccess(accessToken);
      res.json({ hasAccess });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/check-scenario-access", async (req, res) => {
    try {
      const accessToken = req.headers['x-access-token'] as string;
      
      if (!accessToken) {
        return res.json({ hasAccess: false });
      }
      
      const hasAccess = await storage.checkScenarioAccess(accessToken);
      res.json({ hasAccess });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Email subscription endpoint - SECURED
  // Only accepts subscription for verified bundle purchases (one subscription per payment)
  app.post("/api/subscribe-email", async (req, res) => {
    try {
      const emailSchema = z.object({
        email: z.string().email("Invalid email address"),
        paymentIntentId: z.string().min(1, "Payment intent ID required"),
      });

      const { email, paymentIntentId } = emailSchema.parse(req.body);
      
      // ATOMIC: Mark payment intent as used FIRST to prevent race conditions
      // If verification fails, we'll remove it from the set
      const alreadyUsed = await storage.isPaymentIntentUsedForSubscription(paymentIntentId);
      if (alreadyUsed) {
        return res.status(400).json({ 
          error: "This purchase has already been used to subscribe to the email campaign" 
        });
      }
      
      // Reserve this payment intent immediately (atomic operation)
      await storage.markPaymentIntentUsedForSubscription(paymentIntentId);
      
      try {
        // Verify the payment intent is a valid bundle purchase
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== "succeeded") {
          // Rollback: remove from used set since verification failed
          await storage.unmarkPaymentIntentForSubscription(paymentIntentId);
          return res.status(400).json({ error: "Payment not completed" });
        }
        
        if (paymentIntent.metadata.purchaseType !== "bundle") {
          await storage.unmarkPaymentIntentForSubscription(paymentIntentId);
          return res.status(400).json({ error: "Email subscription only available for bundle purchases" });
        }
        
        if (paymentIntent.amount !== 149) {
          await storage.unmarkPaymentIntentForSubscription(paymentIntentId);
          return res.status(400).json({ error: "Invalid bundle purchase" });
        }
        
        // Check if email is already subscribed
        const existingSub = await storage.getEmailSubscription(email);
        if (existingSub) {
          // Keep payment marked as used (don't rollback)
          return res.json({ 
            success: true, 
            message: "Already subscribed",
            subscription: existingSub 
          });
        }

        // Subscribe the email
        const subscription = await storage.subscribeEmail(email);
        
        res.json({ 
          success: true, 
          message: "Successfully subscribed to 100 Days campaign",
          subscription 
        });
      } catch (verificationError) {
        // Rollback on any error during verification/subscription
        await storage.unmarkPaymentIntentForSubscription(paymentIntentId);
        throw verificationError;
      }
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
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

  const httpServer = createServer(app);

  return httpServer;
}
