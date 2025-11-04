# CeMAP Quiz Application

## Overview

This project is a professional certification quiz application, "J&K Cemap Training," designed to help users prepare for the UK Certificate in Mortgage Advice and Practice (CeMAP) examination. It offers three distinct quiz modes: a free Practice Mode with immediate feedback, a paid Full Exam Mode (100 questions), and a paid Scenario Quiz Mode (150 questions from 50 case studies). A Bundle Package provides access to both paid modes at a reduced price and includes enrollment in a "100 Days to CeMAP Ready" email campaign, delivering daily scenario questions. The application integrates Stripe for payments, features weekly high-scorer leaderboards, and includes periodic advertisement breaks to maintain affordability. The overarching goal is to provide a comprehensive, accessible, and engaging platform for CeMAP exam preparation, leveraging a strong market need for specialized certification training.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The frontend is built with React and TypeScript, utilizing Vite for development and bundling. It employs `shadcn/ui` with Radix UI primitives for a Material Design-inspired UI, supporting light/dark modes via CSS variables. `Wouter` handles client-side routing across eight main routes, including home, quiz modes, results, certificate, and checkout. State management relies on React hooks for local state and TanStack Query for server state. Styling is managed with Tailwind CSS, custom design tokens, and a typography system using Inter and JetBrains Mono fonts.

### Backend

The backend is an Express.js server with TypeScript, exposing a RESTful API. Key endpoints manage question fetching, advertisement retrieval, Stripe payment processing (creating intents, verifying payments), access token generation and validation, email subscription for the "100 Days" campaign, and high score management for leaderboards. Data is currently stored in-memory using a `MemStorage` class, though an `IStorage` interface is in place for future database integration.

### Data Storage

The current implementation uses in-memory storage for a hardcoded question bank (136 regular questions, 50 scenario case studies with 150 questions total) and static advertisements. Questions are designed to test understanding with similar numerical options and specific textbook details. Scenario questions cover a wide range of real-world mortgage situations. The application is configured for Drizzle ORM with PostgreSQL via `@neondatabase/serverless`, with schema definitions and migration setup ready for a persistent database.

### Key Features

*   **Quiz Modes**: Practice (free, 10 questions, immediate feedback, 2 scenario questions), Full Exam (paid, 100 questions, no feedback until end), Scenario Quiz (paid, 50 scenarios/150 questions, immediate feedback, randomized). All modes have an 80% pass threshold for certificate.
*   **Payment & Access Control**: Stripe integration for secure payments (£0.99 for single modes, £1.49 for bundle). Device-based access control uses cryptographic tokens stored in `localStorage`, validated server-side for paid content.
*   **Advertisement System**: Non-dismissible 30-second ads appear at specific points in paid quiz modes, with a message about affordability.
*   **100 Days Email Campaign**: Bundle purchasers providing their email are enrolled to receive 3 random scenario questions with answers daily for 100 days, delivered via Outlook integration.
*   **User Experience**: Features include question count selection, visual feedback, progress tracking, results summaries, topic badges, an optional review system, and weekly leaderboards with name prompting for top performers.
*   **Design Principles**: Emphasizes progressive disclosure, optimal reading length, consistent spacing, and clear visual hierarchy for a professional user experience.

### Code Organization

The project uses a monorepo structure with `/client` (React frontend), `/server` (Express backend), and `/shared` (shared TypeScript types). Path aliases are configured for easier imports. The build process uses Vite for the client and esbuild for the server.

## External Dependencies

*   **UI Frameworks**: React 18, Radix UI (primitives), shadcn/ui (design system).
*   **Styling**: Tailwind CSS, class-variance-authority, clsx, tailwind-merge.
*   **State & Data Fetching**: TanStack Query v5, React Hook Form, Zod.
*   **Database/ORM (Configured, not fully active)**: Drizzle ORM, Drizzle Kit, @neondatabase/serverless.
*   **Routing**: wouter.
*   **Payment Processing**: Stripe (stripe-js, react-stripe-js, stripe).
*   **Email Integration**: Microsoft Graph Client, Outlook (ukcemap@outlook.com).
*   **Development Tools**: Vite, tsx, esbuild, Replit plugins.
*   **Utilities**: date-fns, nanoid, Lucide React (icons).