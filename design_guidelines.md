# CeMAP Quiz Application - Design Guidelines

## Design Approach

**Selected Approach**: Design System - Material Design Inspired
**Justification**: This is a professional certification tool requiring clarity, consistency, and optimal learning conditions. Material Design's emphasis on clear hierarchy, purposeful feedback, and content-first design aligns perfectly with educational applications where user comprehension and task completion are paramount.

**Key Design Principles**:
- **Clarity First**: Every element serves the learning experience
- **Progressive Disclosure**: Information revealed when needed, not overwhelming
- **Confidence Building**: Visual feedback reinforces learning progress
- **Professional Polish**: Reflects the serious nature of mortgage certification

---

## Typography System

**Font Family**: 
- Primary: Inter or DM Sans (Google Fonts)
- Monospace: JetBrains Mono (for question numbers/scores)

**Hierarchy**:
- **App Title/Headers**: text-4xl to text-5xl, font-bold
- **Mode Selection Headers**: text-3xl, font-semibold
- **Question Text**: text-xl to text-2xl, font-medium, leading-relaxed
- **Answer Options**: text-lg, font-normal
- **Topic Badges**: text-sm, font-medium, uppercase tracking-wide
- **Feedback Messages**: text-base to text-lg, font-medium
- **Supporting Text**: text-sm to text-base, font-normal
- **Ad Content**: text-lg, font-semibold

**Reading Optimization**: Use max-w-3xl for question content to maintain optimal reading line length

---

## Layout & Spacing System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16, 20, 24** for consistent rhythm
- Micro spacing (buttons, badges): p-2, p-3, gap-2
- Component spacing (cards, sections): p-6, p-8, gap-4, gap-6
- Major sections: py-12, py-16, py-20
- Generous breathing room: py-24 for mode selection screens

**Container Strategy**:
- Main container: max-w-4xl mx-auto for optimal question readability
- Mode selection: max-w-6xl mx-auto for grid layouts
- Full-width sections only for headers/footers

**Vertical Flow**:
- Header: py-6 to py-8
- Main content areas: py-12 to py-20
- Question cards: p-8 to p-12
- Footer/results: py-16

---

## Component Library

### 1. **Mode Selection Screen**
- **Hero Section**: 
  - Minimal centered hero (h-auto, not forced viewport)
  - App title with icon (graduation cap/clipboard)
  - Tagline: "Master UK Mortgage Certification"
  - Stat badges: "100+ Questions | 8 Topics | Pass Mark 80%"
  
- **Mode Cards Grid**: 
  - Two-column layout (grid-cols-1 md:grid-cols-2)
  - Large interactive cards with:
    - Icon/illustration at top
    - Mode name (text-2xl)
    - Description paragraph
    - Feature bullets (question count, feedback type, time estimate)
    - Prominent CTA button
  - Hover elevation effect (shadow transitions)

### 2. **Question Interface**
- **Progress Bar**: 
  - Fixed top position
  - Shows current question / total
  - Visual progress fill
  - Topic badge integrated

- **Question Card**:
  - Centered, elevated card (shadow-lg)
  - Question number + topic badge in header
  - Question text with generous line-height
  - Answer options as large, clickable cards:
    - Grid layout (grid-cols-1, gap-4)
    - Each option as bordered card with hover state
    - Letter prefix (A/B/C/D) in circle badge
    - Full-width click target
  - Submit button (only enabled after selection)

### 3. **Feedback States**
- **Immediate Feedback** (Practice Mode):
  - Correct: Success banner with checkmark icon
  - Incorrect: Warning banner showing correct answer
  - Smooth slide-in animation
  - "Next Question" button

- **Ad Break Screen**:
  - Full-screen centered modal overlay
  - Large ad content card
  - Countdown timer with circular progress indicator
  - Skip button appears after 5 seconds (optional enhancement)
  - Sponsored message styling distinct from app content

### 4. **Results Screen**
- **Score Display**:
  - Hero-sized score numbers
  - Circular progress indicator (donut chart)
  - Pass/Fail badge (prominent visual distinction)
  
- **Performance Breakdown**:
  - Grid of topic performance cards (grid-cols-2 lg:grid-cols-4)
  - Each showing: topic name, questions attempted, percentage
  - Visual indicators (icons) for strong/weak areas

- **Action Buttons**:
  - Primary: "Retake Quiz" / "Try Exam Mode"
  - Secondary: "Review Answers" (if implementing)
  - Tertiary: "Back to Home"

### 5. **Navigation & Controls**
- **Header**: 
  - App logo/title (left)
  - Mode indicator badge (center)
  - Exit/Home button (right)
  - Minimal height (h-16)

- **Buttons**:
  - Primary action: rounded-lg, px-8, py-4, text-lg
  - Secondary: bordered variant
  - Answer options: rounded-md, p-4, border-2
  - Icon buttons: p-3, rounded-full

### 6. **Visual Feedback Elements**
- **Loading States**: Skeleton loaders for question transitions
- **Transitions**: Smooth fade/slide between questions (300ms)
- **Selection States**: Border emphasis and subtle background on selected answer
- **Disabled States**: Reduced opacity for inactive buttons

---

## Images

**No hero image required**. This is a utility-focused application where immediate access to functionality matters more than visual branding. Instead:

- Use **icons** extensively (Heroicons recommended):
  - Graduation cap for educational context
  - Clipboard/document for quiz modes
  - Trophy for results
  - Clock for timed elements
  - Check/X for feedback

- **Illustrations** (optional, use icon-style illustrations):
  - Small decorative SVG illustrations in mode selection cards
  - Success/failure illustrations in results screen
  - Keep minimal and supportive, not decorative

---

## Accessibility Implementation

- All interactive elements meet 44x44px minimum touch target
- Clear focus states with visible outlines (ring-2 ring-offset-2)
- Semantic HTML for screen readers (proper heading hierarchy)
- Answer options keyboard navigable (arrow keys)
- Submit button accessible via Enter key
- ARIA labels for progress indicators and timers
- Sufficient contrast ratios for all text (WCAG AA minimum)
- Form inputs with associated labels
- Error messages clearly associated with inputs

---

## Animations (Minimal Use)

- Question transition: 200ms fade
- Answer selection: 150ms scale/border animation
- Progress bar fill: 300ms ease-out
- Feedback banner slide-in: 250ms
- **NO** complex scroll animations, parallax, or decorative motion