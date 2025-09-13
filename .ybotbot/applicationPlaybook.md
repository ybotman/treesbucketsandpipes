# Trees, Buckets, and Pipes - Application Playbook

## Overview

Trees, Buckets, and Pipes (TBaP) is a personality assessment and self-discovery platform that helps people understand themselves and others through five measurable dimensions of human behavior. Built as a Next.js web application, it provides interactive assessments, real-time calculations, and visual representations of personality profiles.

## Core Purpose & Philosophy

### Book's Foundation
- **Core Belief**: Every person is good, even in dysfunction - people act from wiring that once served them
- **Mission**: Transform conflict into clarity, judgment into recognition, and friction into collaboration
- **Promise**: More patience for yourself, more curiosity for others, less fear of difference

### Application's Role
The web application extends the book's framework into a practical assessment tool that:
- Calculates personality scores across five dimensions
- Generates visual interaction maps showing where people fall
- Provides both self-assessment and team collaboration insights
- Helps users understand stress patterns and behavioral tendencies

## The Five Dimensions Framework

### 1. Tree (Why We Change) - Core Motivations
**Scale**: 1-100 with 8 blended types equally distributed (12.5 units each)

**Value Ranges and Types:**
- **93.75-6.25**: Root-Leaf (wraps around where 1 and 100 meet at bottom of dial)
- **6.25-18.75**: Root (Harmony, belonging, connection)
- **18.75-31.25**: Root-Trunk (Blend of harmony and mastery)
- **31.25-43.75**: Trunk (Mastery, reliability, stability)
- **43.75-56.25**: Trunk-Branch (Blend - center point at value 50)
- **56.25-68.75**: Branch (Impact, legacy, influence)
- **68.75-81.25**: Branch-Leaf (Blend of impact and novelty)
- **81.25-93.75**: Leaf (Novelty, discovery, exploration)

**Key Scale Points:**
- Value 1: Root-Leaf (bottom of dial)
- Value 50: Trunk-Branch boundary (top of dial)
- Value 100: Root-Leaf (wraps back to bottom)

**Circular Dial Implementation:**
- Scale starts at bottom (180°) with Root-Leaf where values 1 and 100 meet
- Progresses clockwise through all 8 types
- Each type occupies 45° of the circle (360°/8)
- Dial rotates to bring current value to top pointer
- Green highlight segment at top shows active range

**Implementation**: 10-question assessment calculating weighted average (scaled to 1-100)

### 2. Bucket (How We Decide)
- **Level (1-10)**: How much we rely on gut instinct vs. analysis
- **Thickness (1-10)**: How firmly we hold truths under stress

**Implementation**: Two separate 10-question assessments with independent scoring

### 3. Input Pipe (How We Learn)
- **Narrow (1-3)**: Learning by doing, self-reliance
- **Medium (4-7)**: Balanced approach
- **Wide (8-10)**: Seeking multiple perspectives

**Implementation**: 10-question assessment (1-10 scale)

### 4. Output Pipe (How We Share)
- **Narrow (1-3)**: Quiet, selective sharing
- **Medium (4-7)**: Balanced expression
- **Wide (8-10)**: Expressive, persuasive sharing

**Implementation**: 10-question assessment (1-10 scale)

### 5. Engagement Model (Derived Interaction Style)
**Four Archetypes (Tree × Output Pipe):**
- **Harmonious Nurturer**: People-focused (Roots/Trunks) + Narrow Output
- **Inspiring Connector**: People-focused + Wide Output
- **Grounded Analyst**: Fact-focused (Branches/Leaves) + Narrow Output
- **Impactful Driver**: Fact-focused + Wide Output

## Technical Architecture

### Stack
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React hooks with localStorage persistence
- **Routing**: App Router with client-side navigation
- **Data Persistence**: Browser localStorage (no backend)

### Project Structure
```
src/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Home/landing page
│   ├── assess/            # Assessment questionnaire flow
│   ├── analytics/         # Results and visualization
│   └── layout.tsx         # Root layout with navigation
├── components/            # React components
│   ├── CircularSlider.tsx # Manual score input control
│   ├── MeasureGauge.tsx   # Arc visualization for scores
│   ├── TreeCompass.tsx    # Engagement model visualization
│   └── ui/                # shadcn/ui components
├── data/
│   └── questions.json     # All assessment questions
├── lib/
│   ├── calculations.ts    # Core scoring algorithms
│   └── utils.ts          # Utility functions
└── types/
    └── assessment.ts      # TypeScript interfaces
```

### Key Components

#### Assessment System (`/assess`)
- **Dual Mode**: Toggle between questionnaire and manual input
- **Question Flow**: Sequential presentation with progress tracking
- **Scoring**: Real-time calculation as users answer
- **Persistence**: Saves to localStorage after each answer
- **Reset**: Clear all scores and start fresh

#### Analytics Dashboard (`/analytics`)
- **TreeCompass**: Circular visualization plotting Tree vs Output
- **MeasureGauge**: Arc gauges showing score ranges
- **Score Display**: Numeric values with archetype labels
- **Engagement Model**: Derived personality type with description

#### Manual Input (`CircularSlider`)
- **Visual Control**: Circular slider for intuitive Tree score entry (1-100)
- **Instant Feedback**: Updates calculations immediately
- **Null Handling**: Supports undefined/unknown values
- **Mobile Optimized**: Touch-friendly interface
- **Dial Mechanics**:
  - Fixed pointer at top (north position)
  - Dial rotates to bring selected value to pointer
  - Labels rotate with dial but counter-rotate text to stay readable
  - Green highlight segment shows active selection area
  - Center displays current numeric value
  - Top displays current type name (Root, Trunk, etc.)
- **Scale Layout**:
  - Root-Leaf at bottom of dial (6 o'clock) where 1 and 100 meet
  - Clockwise progression: Root → Root-Trunk → Trunk → Trunk-Branch → Branch → Branch-Leaf → Leaf
  - Each segment spans 45° (12.5 value units)

### Core Algorithms

#### Tree Score Calculation
```typescript
// Weighted average of 10 questions scaled to 1-100
treeScore = (Σ(answer × weight) / Σ(weights)) * 10

// Type determination based on score ranges (12.5 units each):
function getTreeType(score: number): string {
  if (score <= 6.25 || score > 93.75) return 'Root-Leaf';
  if (score <= 18.75) return 'Root';
  if (score <= 31.25) return 'Root-Trunk';
  if (score <= 43.75) return 'Trunk';
  if (score <= 56.25) return 'Trunk-Branch';
  if (score <= 68.75) return 'Branch';
  if (score <= 81.25) return 'Branch-Leaf';
  if (score <= 93.75) return 'Leaf';
  return 'Root-Leaf';
}
```

#### Engagement Model Derivation
```typescript
// X-axis: Output Pipe (1-10)
// Y-axis: Tree Score (1-100) - people vs fact focus
// Tree < 50: People-focused (Roots/Root-Trunk/early Trunk)
// Tree > 50: Fact-focused (late Trunk/Trunk-Branch/Branches/Leaves)
// Quadrants determine archetype
if (tree < 50 && outputNarrow) return "Harmonious Nurturer"
if (tree < 50 && outputWide) return "Inspiring Connector"
if (tree >= 50 && outputNarrow) return "Grounded Analyst"
if (tree >= 50 && outputWide) return "Impactful Driver"
```

#### Coordinate Transformation
```typescript
// Polar to Cartesian for compass visualization
x = radius * cos(angle)
y = radius * sin(angle)
// With threshold-based archetype boundaries
```

## User Journey

### First-Time User Flow
1. **Landing Page**: Introduction to framework and assessment
2. **Choose Mode**: Questionnaire or manual input
3. **Complete Assessment**: Answer 50 questions or set 5 sliders
4. **View Results**: See scores, archetypes, and visualizations
5. **Explore Analytics**: Understand interaction style and patterns

### Returning User Flow
1. **Preserved State**: Previous scores loaded from localStorage
2. **Quick Access**: Direct navigation to analytics
3. **Refinement**: Adjust individual scores manually
4. **Comparison**: Track changes over time

## Data Model

### Assessment State
```typescript
interface AssessmentState {
  tree: { answers: number[], score: number | null }
  bucket: { answers: number[], score: number | null }
  thickness: { answers: number[], score: number | null }
  input: { answers: number[], score: number | null }
  output: { answers: number[], score: number | null }
  currentMeasure: MeasureType
  currentQuestionIndex: number
  manualMode: boolean
}
```

### Question Structure
```typescript
interface Question {
  id: string
  measure: MeasureType
  question: string
  lowLabel: string   // 1-3 description
  midLabel: string   // 4-7 description
  highLabel: string  // 8-10 description
  weight?: number    // For weighted calculations
}
```

## Stress & Dysfunction Patterns

The framework recognizes that stress reveals wiring:

### Under Stress
- **Roots**: Harmony → Avoidance, conflict aversion
- **Trunks**: Mastery → Rigidity, inflexibility
- **Branches**: Impact → Dominance, control
- **Leaves**: Novelty → Restlessness, instability

### Bucket Stress Responses
- **Thin Buckets**: Quick confidence loss, self-doubt
- **Thick Buckets**: Over-trusting despite setbacks

### Pipe Stress Patterns
- **Narrowing**: Withdrawal, self-reliance
- **Widening**: Over-seeking validation or over-sharing

## Development Guidelines

### Code Patterns
- **Component Composition**: Small, focused components
- **Type Safety**: Strict TypeScript throughout
- **State Management**: Centralized in assess page
- **Styling**: Utility-first with Tailwind
- **Accessibility**: ARIA labels, keyboard navigation

### Testing Approach
- Component testing for UI elements
- Unit tests for calculation functions
- Integration tests for assessment flow
- Manual testing for visualizations

### Performance Considerations
- Client-side only (no server load)
- Minimal bundle size with tree shaking
- Lazy loading for visualization components
- LocalStorage for instant persistence

## Future Enhancements

### Potential Features
1. **User Accounts**: Server-side persistence, history tracking
2. **Team Assessments**: Group dynamics visualization
3. **PDF Reports**: Downloadable assessment results
4. **API Integration**: Connect with HR/team tools
5. **Coaching Mode**: Guided interpretation of results
6. **Stress Assessments**: Specific dysfunction pattern analysis

### Technical Improvements
1. **Database Integration**: Move from localStorage to proper persistence
2. **Authentication**: User login and profile management
3. **Real-time Collaboration**: Share and compare profiles
4. **Mobile App**: Native iOS/Android versions
5. **Analytics Platform**: Aggregate insights across users

## Maintenance & Operations

### Current Limitations
- **Data Loss Risk**: Browser storage can be cleared
- **No Backup**: Single device limitation
- **Privacy**: No data encryption
- **Scalability**: Client-side only architecture

### Monitoring Points
- Browser compatibility issues
- LocalStorage quota limits
- Calculation accuracy edge cases
- Visualization rendering performance

## Success Metrics

### User Engagement
- Assessment completion rate
- Return visitor frequency
- Manual vs questionnaire mode usage
- Time spent in analytics

### Technical Health
- Page load performance
- Calculation accuracy
- Browser compatibility coverage
- Error rate monitoring

## Support & Resources

### Documentation
- This playbook for technical reference
- Book content for framework understanding
- Component Storybook (if implemented)
- API documentation (future)

### Contact
- Development: Toby Balsley
- Support: toby.balsley@gmail.com
- Website: ybotbot.com

---

## Summary

The Trees, Buckets, and Pipes application successfully translates a comprehensive personality framework into an accessible web tool. It combines sophisticated psychological insights with clean technical implementation, providing users with immediate, visual feedback about their behavioral patterns and interaction styles. The architecture prioritizes user experience and simplicity while maintaining the depth and nuance of the underlying framework.