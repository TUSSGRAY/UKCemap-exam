import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { quizRequestSchema } from "@shared/schema";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/questions", async (req, res) => {
    try {
      const mode = (req.query.mode as "practice" | "exam") || "practice";
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

  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      // Hardcode the amount on the server - never trust client input for payment amounts
      const EXAM_PRICE_GBP = 0.99;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 99, // £0.99 in pence (hardcoded)
        currency: "gbp",
        metadata: {
          product: "cemap_full_exam"
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
      
      if (paymentIntent.status === "succeeded" && paymentIntent.amount === 99) {
        await storage.recordExamPurchase(paymentIntentId);
        res.json({ verified: true, hasAccess: true });
      } else {
        res.json({ verified: false, hasAccess: false });
      }
    } catch (error: any) {
      res.status(500).json({ message: "Error verifying payment: " + error.message });
    }
  });

  app.get("/api/check-exam-access", async (req, res) => {
    try {
      const hasAccess = await storage.checkExamAccess();
      res.json({ hasAccess });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
