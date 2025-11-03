# CeMAP Quiz Application

## Overview

A professional certification quiz application designed to help users prepare for the UK Certificate in Mortgage Advice and Practice (CeMAP) examination. The application features two distinct modes: Practice Mode (with immediate feedback and flexible question counts) and Exam Mode (100 questions with results shown at the end). The system includes periodic advertisement breaks during quiz sessions and tracks user performance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool and development server

**UI Component System**: Built on shadcn/ui with Radix UI primitives
- Material Design-inspired design system emphasizing clarity and professional polish
- Custom theming system using CSS variables for light/dark mode support
- Comprehensive component library including cards, buttons, dialogs, progress indicators, and form elements

**Routing**: Wouter for client-side routing with four main routes:
- Home page (mode selection)
- Practice quiz (`/quiz/practice`)
- Exam quiz (`/quiz/exam`)
- Results page (`/results`)

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
- `GET /api/questions?mode={practice|exam}&count={number}` - Fetches questions based on quiz mode
- `GET /api/adverts/random` - Retrieves a random advertisement

**Data Layer**: Currently using in-memory storage (MemStorage class) with an interface-based storage abstraction (IStorage) that allows for future database implementation

**Development Environment**: Vite middleware integration for hot module replacement during development, with separate build process for production

### Data Storage Solutions

**Current Implementation**: In-memory storage with hardcoded question bank and advertisements
- 136 challenging questions organized by 8 CeMAP topics: Financial Services Industry, Economic Policy, UK Taxation, Welfare Benefits, Mortgage Products, Protection Products, Legal Aspects of Mortgages, and Mortgage Market
- Questions feature numerically similar answer options to test genuine understanding rather than simple recall (e.g., "£12,570" vs "£11,850" for personal allowance, "183 days" vs "120 days" for residency)
- Questions include specific textbook details: GRAM/PADS acronyms, MPC meeting frequency (8/year), IHT taper relief percentages, SDLT rate bands, Universal Credit taper rate (55%), triple lock (2.5%), NICs requirements (35 years for full pension)
- Three static advertisement messages

**Database Schema** (Drizzle ORM ready):
- Questions table with fields: id, topic, question, optionA-D, answer
- Configured for PostgreSQL via `@neondatabase/serverless` driver
- Schema defined in `shared/schema.ts` using Drizzle ORM with Zod validation
- Migration setup configured in `drizzle.config.ts`

**Data Models**:
- Question: Core quiz question with multiple choice options
- QuizMode: Enum type ("practice" | "exam")
- QuizSession: Client-side session tracking current progress
- Advert: Advertisement content structure

### Key Features

**Quiz Modes**:
- Practice Mode: Flexible question count (5-100), immediate feedback after each answer, supports returning home mid-quiz
- Exam Mode: Fixed 100 questions, no feedback until completion, 80% pass threshold

**Advertisement System**: 
- Modal displays every 9th question with 10-second countdown timer
- Random advertisement selection from predefined pool
- Non-dismissible during countdown period
- Progress bar visualization

**User Experience**:
- Question count selector for practice mode
- Visual feedback for correct/incorrect answers in practice mode
- Progress tracking with question counter
- Results summary with percentage score and pass/fail indication
- Topic badges on questions for content categorization

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