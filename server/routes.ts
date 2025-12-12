import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  quizRequestSchema, 
  insertHighScoreSchema, 
  createPaymentIntentSchema, 
  verifyPaymentSchema,
  registerSchema,
  loginSchema,
  insertContactMessageSchema
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

// Admin middleware
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const isAdmin = await storage.isUserAdmin(req.session.userId);
  if (!isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/all-topics", async (req, res) => {
    try {
      const allQuestions = await storage.getAllQuestions();
      const topics = Array.from(new Set(allQuestions.map(q => q.topic)));
      res.json(topics.sort());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/questions/all", async (req, res) => {
    try {
      const allQuestions = await storage.getAllQuestions();
      res.json(allQuestions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

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

  // Authentication endpoints
  app.post("/api/register", async (req, res) => {
    try {
      const { password, paymentIntentId, ...rest } = registerSchema.parse(req.body);
      
      // If paymentIntentId provided, verify it first before creating user
      let verifiedPayment: { product: string; paymentIntentId: string } | null = null;
      
      if (paymentIntentId) {
        if (!stripe) {
          return res.status(500).json({ error: "Payment processing unavailable" });
        }
        
        // Verify payment with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== "succeeded") {
          return res.status(400).json({ error: "Payment not successful. Please complete payment first." });
        }
        
        // Validate product metadata
        const product = paymentIntent.metadata?.product;
        if (!product || !["subscription"].includes(product)) {
          return res.status(400).json({ error: "Invalid payment: missing or invalid product" });
        }
        
        // Validate amount
        const expectedAmounts = { subscription: 499 };
        const expectedAmount = expectedAmounts[product as keyof typeof expectedAmounts];
        if (paymentIntent.amount !== expectedAmount || paymentIntent.currency !== "gbp") {
          return res.status(400).json({ error: "Payment amount mismatch" });
        }
        
        verifiedPayment = { product, paymentIntentId };
      }
      
      // Storage expects passwordHash field (even though it contains raw password)
      const user = await storage.createUser({
        ...rest,
        passwordHash: password,
      });
      
      // Set session
      req.session.userId = user.id;
      
      // If payment was verified, attach access token to new user
      let accessToken: string | null = null;
      if (verifiedPayment) {
        accessToken = await storage.recordBundlePurchase(
          verifiedPayment.paymentIntentId, 
          user.id
        );
      }
      
      // Return user without password hash
      const { passwordHash, ...userWithoutPassword } = user;
      res.json({ 
        ...userWithoutPassword,
        premiumActivated: !!accessToken,
        accessToken
      });
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

  // Check topic access (all topics except first are locked behind paywall)
  app.get("/api/check-topic-access", async (req, res) => {
    try {
      const hasAccess = req.session?.userId 
        ? await storage.checkExamAccess(req.session.userId!)
        : false;
      res.json({ hasAccess, isAuthenticated: !!req.session?.userId });
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

  // ==================== ADMIN ROUTES ====================

  // Get admin stats
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: "Error fetching admin stats: " + error.message });
    }
  });

  // Get all users
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Return users without password hashes
      const safeUsers = users.map(({ passwordHash, ...user }) => user);
      res.json(safeUsers);
    } catch (error: any) {
      res.status(500).json({ error: "Error fetching users: " + error.message });
    }
  });

  // Grant premium access to a user
  app.post("/api/admin/grant-premium", requireAdmin, async (req, res) => {
    try {
      const { userId, daysValid } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const token = await storage.grantPremiumAccess(userId, daysValid);
      res.json({ success: true, token });
    } catch (error: any) {
      res.status(500).json({ error: "Error granting premium access: " + error.message });
    }
  });

  // Revoke premium access from a user
  app.post("/api/admin/revoke-premium", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      await storage.revokePremiumAccess(userId);
      res.json({ success: true, message: "Premium access revoked" });
    } catch (error: any) {
      res.status(500).json({ error: "Error revoking premium access: " + error.message });
    }
  });

  // Get all contact messages
  app.get("/api/admin/contact-messages", requireAdmin, async (req, res) => {
    try {
      const messages = await storage.getAllContactMessages();
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: "Error fetching contact messages: " + error.message });
    }
  });

  // Delete a contact message
  app.delete("/api/admin/contact-messages/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteContactMessage(req.params.id);
      res.json({ success: true, message: "Message deleted" });
    } catch (error: any) {
      res.status(500).json({ error: "Error deleting message: " + error.message });
    }
  });

  // Mark contact message as read
  app.post("/api/admin/contact-messages/:id/read", requireAdmin, async (req, res) => {
    try {
      await storage.markContactMessageRead(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Error marking message as read: " + error.message });
    }
  });

  // Get page analytics
  app.get("/api/admin/analytics", requireAdmin, async (req, res) => {
    try {
      const analytics = await storage.getPageAnalytics();
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: "Error fetching analytics: " + error.message });
    }
  });

  // ==================== PUBLIC CONTACT ROUTE ====================

  // Submit a contact message (public)
  app.post("/api/contact", async (req, res) => {
    try {
      const message = insertContactMessageSchema.parse(req.body);
      const savedMessage = await storage.createContactMessage(message);
      res.json({ success: true, message: "Your message has been sent successfully!" });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Error sending message: " + error.message });
    }
  });

  // Track page visit (public)
  app.post("/api/track-visit", async (req, res) => {
    try {
      const { pagePath } = req.body;
      if (pagePath) {
        await storage.trackPageVisit(pagePath);
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Error tracking visit" });
    }
  });

  // Check if current user is admin
  app.get("/api/is-admin", requireAuth, async (req, res) => {
    try {
      const isAdmin = await storage.isUserAdmin(req.session.userId!);
      res.json({ isAdmin });
    } catch (error: any) {
      res.status(500).json({ error: "Error checking admin status" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
