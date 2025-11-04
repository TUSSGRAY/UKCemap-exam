# CeMAP Quiz Application

## Overview

A professional certification quiz application designed to help users prepare for the UK Certificate in Mortgage Advice and Practice (CeMAP) examination branded as "J&K Cemap Training". The application features three distinct modes: Practice Mode (free, with immediate feedback and flexible question counts), Full Exam Mode (£0.99 purchase, 100 questions with results shown at the end, behind a secure paywall), and Scenario Quiz Mode (£0.99 purchase, all 50 realistic case studies presented in random order with 150 questions total, behind a secure paywall). The system includes a Bundle Package (£1.49) that provides access to both paid exam modes, saving users 50p. All pricing includes periodic advertisement breaks during quiz sessions, Stripe payment integration, and device-based access control for paid content.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool and development server

**UI Component System**: Built on shadcn/ui with Radix UI primitives
- Material Design-inspired design system emphasizing clarity and professional polish
- Custom theming system using CSS variables for light/dark mode support
- Comprehensive component library including cards, buttons, dialogs, progress indicators, and form elements

**Routing**: Wouter for client-side routing with eight main routes:
- Home page (mode selection with branding and bundle offer)
- Practice quiz (`/quiz/practice`) - Free access, fixed 10 questions, max 2 attempts
- Exam quiz (`/quiz/exam`) - Requires payment (£0.99 or bundle)
- Scenario quiz (`/quiz/scenario`) - Requires payment (£0.99 or bundle)
- Results page (`/results`) - Shows score, handles attempt tracking, redirects to certificate on 80%+ pass
- Certificate page (`/certificate`) - Awards certificate from JK Training on 80%+ pass for all modes
- Checkout page (`/checkout?type={exam|scenario|bundle}`) - Stripe payment with three pricing tiers
- Payment success page (`/payment-success`) - Confirms purchase and grants access

**State Management**: 
- React hooks for local component state
- TanStack Query (React Query) for server state and data fetching
- URL parameters for passing quiz results between pages

**Styling**: 
- Tailwind CSS with custom configuration
- Design tokens defined via CSS custom properties
- Typography system using Inter (primary) and JetBrains Mono (monospace) fonts from Google Fonts

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js

**API Design**: RESTful endpoints:
- `GET /api/questions?mode={practice|exam|scenario}&count={number}` - Fetches questions based on quiz mode (exam and scenario modes require X-Access-Token header)
- `GET /api/adverts/random` - Retrieves a random advertisement
- `POST /api/create-payment-intent` - Creates Stripe payment intent with purchaseType (exam: £0.99, scenario: £0.99, bundle: £1.49)
- `POST /api/verify-payment` - Verifies Stripe payment and generates appropriate access token based on purchase type
- `GET /api/check-exam-access` - Validates access token for exam mode (accepts exam or bundle tokens)
- `GET /api/check-scenario-access` - Validates access token for scenario mode (accepts scenario or bundle tokens)

**Data Layer**: Currently using in-memory storage (MemStorage class) with an interface-based storage abstraction (IStorage) that allows for future database implementation

**Development Environment**: Vite middleware integration for hot module replacement during development, with separate build process for production

### Data Storage Solutions

**Current Implementation**: In-memory storage with hardcoded question bank and advertisements
- 136 challenging questions organized by 8 CeMAP topics: Financial Services Industry, Economic Policy, UK Taxation, Welfare Benefits, Mortgage Products, Protection Products, Legal Aspects of Mortgages, and Mortgage Market
- 50 realistic scenario-based case studies with 3 related questions each (150 scenario questions total)
- Questions feature numerically similar answer options to test genuine understanding rather than simple recall (e.g., "£12,570" vs "£11,850" for personal allowance, "183 days" vs "120 days" for residency)
- Questions include specific textbook details: GRAM/PADS acronyms, MPC meeting frequency (8/year), IHT taper relief percentages, SDLT rate bands, Universal Credit taper rate (55%), triple lock (2.5%), NICs requirements (35 years for full pension)
- Scenario questions cover diverse real-world situations across 50 cases: first-time buyers, remortgages, buy-to-let, self-employed, IHT planning, retirement mortgages, Help to Buy, joint borrower sole proprietor, protection insurance, shared ownership, adverse credit, offset mortgages, bridging loans, lifetime mortgages/equity release, Right to Buy, portfolio landlords, second charge mortgages, Islamic finance, green mortgages, Forces Help to Buy, new build purchases, leasehold properties, CGT calculations, income protection, transfer of equity (divorce), guarantor mortgages, let-to-buy, holiday let, HMO, non-standard construction, auction purchases, early repayment charges, porting mortgages, payment holidays, mortgage prisoners, shared equity schemes, expat/overseas buyers, limited company buy-to-let, agricultural property, retirement villages, probate properties, buildings insurance, age gap mortgages, contractor income, auction completions, multiple adverse credit, property chains, complex income assessment
- Three static advertisement messages

**Database Schema** (Drizzle ORM ready):
- Questions table with fields: id, topic, question, optionA-D, answer
- Configured for PostgreSQL via `@neondatabase/serverless` driver
- Schema defined in `shared/schema.ts` using Drizzle ORM with Zod validation
- Migration setup configured in `drizzle.config.ts`

**Data Models**:
- Question: Core quiz question with multiple choice options, optional scenario and scenarioId fields for case studies
- QuizMode: Enum type ("practice" | "exam" | "scenario")
- QuizSession: Client-side session tracking current progress
- Advert: Advertisement content structure

### Key Features

**Quiz Modes**:
- Practice Mode: Free access, fixed 10 questions, includes 2 scenario-based questions (2 questions from each of 2 random scenarios = 4 scenario questions) mixed with regular questions, immediate feedback after each answer, 80% pass threshold, maximum 2 attempts tracked via localStorage, certificate awarded on 80%+ pass
- Full Exam Mode: £0.99 purchase required (or £1.49 bundle), fixed 100 questions (regular questions only, no scenarios), no feedback until completion, 80% pass threshold, device-based access control, certificate awarded on 80%+ pass
- Scenario Quiz Mode: £0.99 purchase required (or £1.49 bundle), all 50 realistic scenarios presented in random order (150 questions total), immediate feedback after each answer, 80% pass threshold (requires 120/150 to pass), displays case study prominently above questions, scenarios randomized each session, certificate awarded on 80%+ pass

**Payment & Access Control System**:
- Stripe integration for secure payment processing with three pricing tiers:
  - Full Exam Only: £0.99 (100 questions)
  - Scenario Quiz Only: £0.99 (150 questions from 50 scenarios)
  - Bundle Package: £1.49 (both exams - save 50p)
- Device-based access control using cryptographic tokens (UUID)
- Payment amounts hardcoded server-side for security (99p, 99p, 149p)
- Server-side token validation before serving exam and scenario content
- Each successful payment generates unique access token based on purchase type:
  - examAccessToken: Full Exam access only
  - scenarioAccessToken: Scenario Quiz access only
  - bundleAccessToken: Access to both Full Exam and Scenario Quiz
- Tokens stored in localStorage for device persistence
- All exam and scenario API requests require valid X-Access-Token header
- Bundle tokens grant access to both endpoints
- Unauthorized access attempts return 403 Forbidden
- No user authentication required - simple device-based model

**Advertisement System**: 
- Practice Mode: No advertisements
- Full Exam Mode: 30-second ads at questions 30 and 90
- Scenario Quiz Mode: 30-second ads at questions 30 and 90
- Random advertisement selection from predefined pool
- Non-dismissible during countdown period
- Progress bar visualization
- Affordability message: "These adverts help keep the site affordable"

**Review System**:
- After question 15 in Full Exam and Scenario Quiz modes, users are prompted to rate their experience
- 1-5 star rating modal
- Feedback messages based on rating
- Ratings stored in localStorage for reference

**User Experience**:
- Question count selector for practice mode
- Visual feedback for correct/incorrect answers in practice mode
- Progress tracking with question counter
- Results summary with percentage score and pass/fail indication
- Topic badges on questions for content categorization
- Textbook promotion section on home page with link to official CeMAP study materials

**Design Principles**:
- Progressive disclosure to avoid overwhelming users
- Optimal reading line length (max-w-3xl) for question content
- Consistent spacing system using Tailwind units
- Clear visual hierarchy with purposeful typography scale
- Professional polish reflecting the serious nature of certification

### Code Organization

**Monorepo Structure**:
- `/client` - React frontend application
- `/server` - Express backend server
- `/shared` - Shared TypeScript types and schemas
- `/attached_assets` - Static assets and original Python prototype

**Path Aliases**:
- `@/*` maps to `client/src/*`
- `@shared/*` maps to `shared/*`
- `@assets/*` maps to `attached_assets/*`

**Build Process**:
- Client: Vite builds to `dist/public`
- Server: esbuild bundles to `dist/index.js` as ESM module
- TypeScript compilation for type checking (no emit)

## External Dependencies

**UI Framework**:
- React 18 with React DOM
- Radix UI component primitives (20+ components including dialog, progress, radio-group, select, tabs, toast)
- shadcn/ui design system configuration

**Styling**:
- Tailwind CSS with PostCSS
- class-variance-authority for component variants
- clsx and tailwind-merge for className management

**State & Data Fetching**:
- TanStack Query v5 for server state management
- React Hook Form with Zod resolvers for form validation

**Database & ORM** (configured but not actively used):
- Drizzle ORM with Drizzle Kit for migrations
- @neondatabase/serverless for PostgreSQL connection
- Drizzle-Zod for schema validation

**Routing**: 
- wouter for lightweight client-side routing

**Payment Processing**:
- Stripe (@stripe/stripe-js, @stripe/react-stripe-js, stripe)
- Stripe Payment Elements for secure checkout UI
- Server-side payment verification and token generation

**Development Tools**:
- Vite with React plugin
- tsx for TypeScript execution in development
- esbuild for production server bundling
- @replit plugins for enhanced development experience (runtime error overlay, cartographer, dev banner)

**Build & Tooling**:
- TypeScript with strict mode enabled
- ESNext module system
- Vite with custom configuration for monorepo structure

**Utilities**:
- date-fns for date manipulation
- nanoid for ID generation
- Various Lucide React icons throughout the UI

**Session Management** (configured):
- express-session with connect-pg-simple for PostgreSQL session store
- Currently not actively implemented in the codebase