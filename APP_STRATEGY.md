# Trees, Buckets, and Pipes (TBAP) - App Strategy

## Executive Summary
A self-assessment web application based on the TBAP book that helps users understand their motivation (Tree), decision-making style (Bucket), and engagement patterns (Pipes). The app guides users through questionnaires, calculates their positions across three models, and maps them to Interaction Archetypes.

## Core Concepts

### 1. Tree Model (Motivation - Why we change)
- **Root**: Belonging, harmony, connection
- **Trunk**: Mastery, growth, reliability  
- **Branch**: Impact, outcomes, legacy
- **Leaf**: Novelty, discovery, creativity

### 2. Bucket Model (Decision-making - Gut trust & durability)
- **Bucket Level** (1-10): Reliance on gut vs. external input
- **Bucket Thickness** (1-10): Durability of trust when challenged

### 3. Pipes Model (Engagement - Learning & Sharing)
- **Input Pipe**: How much external info needed before deciding
  - Narrow → act quickly with minimal info
  - Wide → gather broadly before acting
- **Output Pipe**: Need to share decisions/knowledge
  - Narrow → quiet, reserved
  - Wide → expressive, persuasive, teaching

### 4. Interaction Archetypes (Tree + Output Pipe)
1. **Harmonious Nurturer**: People-oriented + Narrow output
2. **Inspiring Connector**: People-oriented + Wide output
3. **Grounded Analyst**: Fact-oriented + Narrow output
4. **Impactful Driver**: Fact-oriented + Wide output

## Technical Stack
- **Framework**: Next.js 15 (App Router)
- **UI Library**: MUI 6+
- **Database**: Firestore
- **State Management**: React Context + Hooks
- **Styling**: MUI Theme + Emotion
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel

## Phase 1: Core Assessment Flow (MVP)

### Features
1. **Question Gathering UI**
   - 5 tabbed sections (Tree, Knowledge, Resilience, Learning, Sharing)
   - DB-driven question bank
   - 1-10 dial/slider inputs with numeric steppers
   - Autosave to local state
   - Save draft capability

2. **Calculation Engine**
   - Tree type averages (Root/Trunk/Branch/Leaf)
   - Bucket level & thickness scores
   - Input/Output pipe classifications
   - Validation (min 2 questions per Tree type)

3. **Data Persistence**
   - Store raw answers
   - Store derived scores
   - User sessions (anonymous initially)

### Database Schema

#### `questions` Collection
```json
{
  "id": "string",
  "measure": "tree|bucket|input|output",
  "subType": "root|trunk|branch|leaf", // for tree questions
  "dimension": "level|thickness",       // for bucket questions
  "text": "string",
  "help": "string",
  "order": "number",
  "active": "boolean"
}
```

#### `assessments` Collection
```json
{
  "id": "string",
  "userId": "string|null",
  "createdAt": "ISO",
  "updatedAt": "ISO",
  "answers": [
    { "questionId": "string", "value": 1-10 }
  ],
  "derived": {
    "treeScores": {
      "root": "number",
      "trunk": "number",
      "branch": "number",
      "leaf": "number"
    },
    "bucketScores": {
      "level": "number",
      "thickness": "number"
    },
    "pipeScores": {
      "input": "narrow|moderate|wide",
      "output": "narrow|moderate|wide"
    },
    "primaryTree": "root|trunk|branch|leaf",
    "archetype": "string"
  }
}
```

### Routes
- `/` - Landing page with book overview
- `/assess` - Main assessment flow
- `/results` - Individual results visualization
- `/analytics` - Comparative analytics (Phase 2)

## Phase 2: Visualization & Analytics

### Features
1. **Tree Visualization**
   - Circular/ring diagram showing position
   - Blend indicators for multi-type alignments
   - Stress tendency overlays

2. **Bucket Visualization**
   - 2D grid (level vs thickness)
   - Confidence zones
   - Adaptability indicators

3. **Pipes Visualization**
   - Dual spectrum display
   - Flow rate metaphors

4. **Archetype Mapping**
   - Quadrant grid placement
   - Detailed archetype descriptions
   - Strengths/challenges per type

## Phase 3: Advanced Features

### Team/Group Analysis
- Compare multiple assessments
- Team composition mapping
- Collaboration friction/synergy points

### Role Alignment
- Job/role wiring profiles
- Person-role fit analysis
- Career path suggestions

### Growth Tracking
- Historical assessment comparisons
- Development trajectories
- Stress pattern recognition

## Component Architecture

```
src/
├── app/
│   ├── layout.jsx
│   ├── page.jsx
│   ├── assess/
│   │   ├── page.jsx
│   │   └── components/
│   │       ├── AssessmentTabs.jsx
│   │       ├── QuestionList.jsx
│   │       ├── QuestionItem.jsx
│   │       └── DualInput.jsx
│   ├── results/
│   │   └── page.jsx
│   └── api/
│       ├── questions/
│       └── assessments/
├── contexts/
│   └── AssessmentContext.jsx
├── hooks/
│   ├── useAssessment.js
│   └── useQuestions.js
├── utils/
│   ├── calculations.js
│   └── archetypes.js
└── lib/
    └── firebase.js
```

## Key Implementation Details

### Scoring Logic

#### Tree Scoring
- 20 questions total (5 per type)
- Score = average of responses per type
- Primary type = highest average
- Secondary if within 15% of primary

#### Bucket Scoring
- 10 questions (5 level, 5 thickness)
- Direct 1-10 mapping

#### Pipe Scoring
- 5 questions each (Input/Output)
- 1-3.5 = Narrow
- 3.6-6.5 = Moderate  
- 6.6-10 = Wide

#### Archetype Calculation
```js
const getArchetype = (treeType, outputPipe) => {
  const isPeopleOriented = ['root', 'trunk'].includes(treeType);
  const isWideOutput = outputPipe === 'wide';
  
  if (isPeopleOriented && !isWideOutput) return 'Harmonious Nurturer';
  if (isPeopleOriented && isWideOutput) return 'Inspiring Connector';
  if (!isPeopleOriented && !isWideOutput) return 'Grounded Analyst';
  if (!isPeopleOriented && isWideOutput) return 'Impactful Driver';
};
```

## Minimum Viable Questionnaire

### Tree Questions (20 total, 5 per type)
- Root: Focus on belonging, inclusion, harmony
- Trunk: Focus on reliability, consistency, mastery
- Branch: Focus on goals, outcomes, impact
- Leaf: Focus on innovation, exploration, creativity

### Bucket Questions (10 total)
- Level (5): Trust in intuition vs data
- Thickness (5): Resilience to challenge

### Pipe Questions (10 total)
- Input (5): Information gathering preferences
- Output (5): Sharing/expression tendencies

## Success Metrics
- Assessment completion rate > 80%
- Average time to complete: 10-15 minutes
- User returns to view results > 50%
- Share results feature usage > 30%

## Timeline
- **Week 1-2**: Setup, DB schema, question bank
- **Week 3-4**: Assessment UI, calculation engine
- **Week 5-6**: Results visualization (basic)
- **Week 7-8**: Polish, testing, deployment
- **Future**: Advanced analytics, team features

## Accessibility Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation for all interactions
- Screen reader announcements for state changes
- High contrast mode support
- Mobile responsive (320px+)

## Testing Strategy
- Unit tests for calculation logic
- Integration tests for assessment flow
- E2E tests for critical paths
- Accessibility audits with axe-core
- Performance testing (Lighthouse)

## Deployment
- Vercel for hosting
- GitHub Actions for CI/CD
- Environment branches: dev, staging, production
- Analytics: Vercel Analytics + custom events

## Future Considerations
- User accounts with OAuth
- PDF/email report generation
- API for third-party integrations
- Mobile app (React Native)
- Coaching/consultation booking
- Community features (anonymous comparisons)