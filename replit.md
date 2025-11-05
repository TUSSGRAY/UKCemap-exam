# CeMAP Quiz Application

## Overview

This project is a professional certification quiz application, "J&K Cemap Training," designed to help users prepare for the UK Certificate in Mortgage Advice and Practice (CeMAP) examination. It offers three distinct quiz modes: a free Practice Mode (10 questions with immediate feedback and Google AdSense ads), a paid Full Exam Mode (£0.99, 50 questions), and a paid Scenario Quiz Mode (£0.99, 50 questions from 10 case studies). A Bundle Package (£1.49) provides access to both paid modes at a discounted price and includes enrollment in a "100 Days to CeMAP Ready" email campaign, delivering daily scenario questions. The application integrates Stripe for secure payments, features weekly top-4 leaderboards with all-time high scores displayed in green, and uses device-based access control via localStorage tokens. The overarching goal is to provide a comprehensive, accessible, and engaging platform for CeMAP exam preparation, leveraging a strong market need for specialized certification training.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The frontend is built with React and TypeScript, utilizing Vite for development and bundling. It employs `shadcn/ui` with Radix UI primitives for a Material Design-inspired UI, supporting light/dark modes via CSS variables. `Wouter` handles client-side routing across six main routes: home, three quiz modes (practice, exam, scenario), results, and certificate. State management relies on React hooks for local state and TanStack Query for server state. Styling is managed with Tailwind CSS, custom design tokens, and a typography system using Inter and JetBrains Mono fonts.

### Backend

The backend is an Express.js server with TypeScript, exposing a RESTful API. Key endpoints manage question fetching, advertisement retrieval, Stripe payment processing (creating intents, verifying payments), access token generation and validation, email subscription for the "100 Days" campaign, and high score management for leaderboards. Data is stored in PostgreSQL database using Drizzle ORM via `@neondatabase/serverless`, with access tokens, email subscriptions, and high scores persisted in the database.

### Data Storage

The application uses PostgreSQL database for persistent storage of access tokens, email subscriptions, and high scores via Drizzle ORM. The question bank uses in-memory storage with a hardcoded bank of 136 regular questions and 10 scenario case studies with 5 questions each (50 questions total). Questions are designed to test understanding with similar numerical options and specific textbook details. Scenario questions cover a wide range of real-world mortgage situations.

### Key Features

*   **Quiz Modes**: Practice (free, 10 questions, immediate feedback, 2 scenario questions), Full Exam (paid, 50 questions, no feedback until end), Scenario Quiz (paid, 10 scenarios/50 questions, immediate feedback, randomized). All modes have an 80% pass threshold for certificate.
*   **Payment & Access Control**: Stripe integration with comprehensive security hardening:
    - **Secure Payments**: £0.99 for single modes (exam/scenario), £1.49 for bundle package
    - **Device-Based Access**: Cryptographic UUID tokens stored in `localStorage`, validated server-side
    - **Security Hardening** (November 2025):
      - Product derived exclusively from Stripe payment metadata (zero client trust)
      - Amount and currency validation (99p/149p GBP enforcement)
      - Replay attack prevention via bidirectional payment intent ↔ token mapping
      - Access tokens transmitted via POST body (not URL parameters) to prevent log/history leakage
      - Input validation with Zod to prevent DoS from malformed requests
      - Generic error messages to prevent information disclosure
*   **Advertisement System**: 
    - **Practice Mode**: 20-second non-dismissible Google AdSense ads at questions 3, 6, and 9 to help monetize the free tier and cover hosting costs
    - **Paid Modes**: 30-second custom ads at questions 25 and 45 for exam mode, questions 25 and 45 for scenario mode
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
*   **Monetization**: Google AdSense (Publisher ID: ca-pub-4127314844320855) for practice mode advertisements.

## Google AdSense Setup

The application uses Google AdSense to monetize the free practice mode with 20-second ads at questions 3, 6, and 9.

### Current Configuration
- **Publisher ID**: ca-pub-4127314844320855 (configured in `client/index.html`)
- **Ad Slot ID**: Needs to be created in Google AdSense dashboard
- **Component**: `client/src/components/google-adsense-ad.tsx`

### To Enable Real Ads
1. Log into your Google AdSense account
2. Create a new ad unit (recommended: responsive display ad)
3. Copy the ad slot ID (format: `1234567890`)
4. Update `GOOGLE_ADSENSE_SLOT_ID` in `client/src/components/google-adsense-ad.tsx`
5. The ads will automatically start showing in practice mode

### Ad Display Behavior
- Appears at questions 3, 6, and 9 in practice mode
- Non-dismissible 20-second timer
- Shows placeholder when ad slot is not configured
- Progress bar indicates time remaining
- Continues to next question automatically when timer expires

## Progressive Web App (PWA) Implementation

The application is a fully functional Progressive Web App with offline capabilities and installability.

### Service Worker
- **Location**: `client/public/sw.js`
- **Registration**: Automatic on page load via `client/index.html`
- **Status**: Successfully registered and active

### Caching Strategy
- **Static Assets**: Cache-first with background updates for improved performance
- **API Calls**: Network-first to always fetch fresh data
- **Offline Fallback**: Serves cached content when network is unavailable

### PWA Manifest
- **Location**: `client/public/manifest.json`
- **Branding**: ukcemap.co.uk
- **Description**: Professional CeMAP training and quiz app
- **Display Mode**: Standalone (appears like a native app)
- **Theme Colors**: White background and theme color

### Features
- **Installability**: Users can install the app on mobile devices and desktop
- **Offline Support**: Quiz content and static assets work offline after first visit
- **Auto-Updates**: Service worker checks for updates every minute
- **Performance**: Cached assets load instantly on repeat visits

### Installation
- **Mobile (iOS)**: Safari > Share > Add to Home Screen
- **Mobile (Android)**: Chrome > Menu > Install App
- **Desktop**: Chrome/Edge > Install icon in address bar

### Payment Integration Enhancement
- **Apple Pay**: Automatically available on Safari (iOS/macOS) for supported devices
- **Google Pay**: Automatically available on Chrome for configured accounts
- **Payment Request Button**: Shows digital wallet options when available
- **Fallback**: Traditional card payment form always available