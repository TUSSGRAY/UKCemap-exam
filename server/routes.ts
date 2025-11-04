import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { quizRequestSchema } from "@shared/schema";
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
      
      // Hardcode prices on server - never trust client input
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

  const httpServer = createServer(app);

  return httpServer;
}
