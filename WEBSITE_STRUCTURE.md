# TBAP Website Structure

## Core Concept: Dual Input System

The app offers **TWO ways** to complete the assessment:

1. **Question-Based Mode** (Default): Answer questions that calculate scores
2. **Manual Override Mode**: Directly drag sliders for each measure with constraints

Users can toggle between modes with an "Override" button.

## The 5 Measures (TABS)

Each measure gets a score from 1-99:

### 1. Tree Distribution (Motivation)
- **Root** (1-24): Belonging, harmony
- **Trunk** (25-49): Mastery, reliability  
- **Branch** (50-74): Impact, outcomes
- **Leaf** (75-99): Novelty, creativity

### 2. Bucket Level (Gut Trust)
- 1-33: Low trust in gut (need external validation)
- 34-66: Balanced trust
- 67-99: High trust in gut (self-confident)

### 3. Bucket Thickness (Resilience)
- 1-33: Fragile (easily influenced)
- 34-66: Moderate durability
- 67-99: Thick (resistant to challenge)

### 4. Input Pipe (Learning Style)
- 1-33: Narrow (minimal info needed)
- 34-66: Moderate gathering
- 67-99: Wide (extensive research)

### 5. Output Pipe (Sharing Style)
- 1-33: Narrow (reserved, quiet)
- 34-66: Moderate sharing
- 67-99: Wide (expressive, teaching)

## Constraint System

### Question-Based Mode
- Each measure has N questions (e.g., 5 questions)
- Each question: 1-99 scale
- **CONSTRAINT**: Sum of all answers per measure = N × 50
- Example: 5 questions must sum to 250
- If you move one to 99, others auto-adjust down proportionally

### Manual Override Mode
- Direct slider for each measure (1-99)
- No constraints - set each independently
- Instant visual feedback

## Website Structure

```
/
├── Landing Page
│   ├── Hero: "Understand Your Wiring"
│   ├── Book Overview
│   ├── Start Assessment CTA
│   └── Login (optional)
│
├── /assess
│   ├── Mode Toggle [Questions | Override]
│   ├── Progress Bar
│   ├── 5 Tabs (Horizontal on desktop, dropdown on mobile)
│   │   ├── Tree Tab
│   │   ├── Bucket Level Tab
│   │   ├── Bucket Thickness Tab
│   │   ├── Input Pipe Tab
│   │   └── Output Pipe Tab
│   └── Action Bar
│       ├── Save Draft
│       ├── Reset
│       └── Calculate Results
│
├── /results
│   ├── Summary Cards (5 measures)
│   ├── Tree Visualization (ring chart)
│   ├── Bucket Grid (2D plot)
│   ├── Pipes Diagram (dual bars)
│   ├── Archetype Badge
│   ├── Detailed Interpretation
│   └── Share/Export Options
│
├── /compare (Phase 2)
│   ├── Add Profiles
│   ├── Side-by-side Comparison
│   └── Team Dynamics Analysis
│
└── /resources
    ├── About TBAP
    ├── Measure Explanations
    └── FAQ
```

## Component Architecture

### Assessment Page Components

```jsx
<AssessmentPage>
  <ModeToggle>
    [Questions Mode] [Override Mode]
  </ModeToggle>
  
  <AssessmentTabs>
    {/* QUESTION MODE */}
    <TreeTab>
      <ConstrainedQuestionSet total={250}>
        <Question id="tree_1" value={50} />
        <Question id="tree_2" value={50} />
        <Question id="tree_3" value={50} />
        <Question id="tree_4" value={50} />
        <Question id="tree_5" value={50} />
      </ConstrainedQuestionSet>
    </TreeTab>
    
    {/* OVERRIDE MODE */}
    <TreeTab>
      <ManualSlider 
        label="Tree Position"
        value={50}
        min={1}
        max={99}
        zones={[
          {range: [1,24], label: "Root"},
          {range: [25,49], label: "Trunk"},
          {range: [50,74], label: "Branch"},
          {range: [75,99], label: "Leaf"}
        ]}
      />
    </TreeTab>
  </AssessmentTabs>
  
  <ActionBar>
    <SaveDraft />
    <Reset />
    <Calculate />
  </ActionBar>
</AssessmentPage>
```

## UI/UX Specifications

### Question Mode Interface
```
┌─────────────────────────────────────┐
│ Tree Assessment (Question Mode)     │
│                                     │
│ Q1: I prioritize group harmony      │
│ [●──────────────] 50/99            │
│                                     │
│ Q2: I focus on personal mastery    │
│ [────●──────────] 50/99            │
│                                     │
│ Q3: I drive for measurable impact  │
│ [────────●──────] 50/99            │
│                                     │
│ Q4: I seek novel experiences       │
│ [──────────●────] 50/99            │
│                                     │
│ Q5: I value stability              │
│ [────────────●──] 50/99            │
│                                     │
│ Total: 250/250 ✓                   │
└─────────────────────────────────────┘
```

### Override Mode Interface
```
┌─────────────────────────────────────┐
│ Tree Assessment (Override Mode)     │
│                                     │
│        ROOT   TRUNK  BRANCH  LEAF  │
│         ↓       ↓      ↓      ↓    │
│ [●──────────────────────────────]  │
│  1                50              99│
│                                     │
│ Current: BRANCH (62)                │
│                                     │
│ Your primary motivation is Impact   │
└─────────────────────────────────────┘
```

## Constraint Algorithm (Question Mode)

```javascript
function enforceConstraint(questions, changedIndex, newValue) {
  const TOTAL = questions.length * 50;
  const MIN = 1;
  const MAX = 99;
  
  // Calculate how much we're off
  const currentSum = questions.reduce((sum, q) => sum + q.value, 0);
  const targetSum = TOTAL - newValue;
  const otherQuestions = questions.filter((_, i) => i !== changedIndex);
  const otherSum = otherQuestions.reduce((sum, q) => sum + q.value, 0);
  
  if (otherSum === 0) {
    // Distribute evenly among others
    const sharePerQuestion = targetSum / otherQuestions.length;
    otherQuestions.forEach(q => {
      q.value = Math.max(MIN, Math.min(MAX, Math.round(sharePerQuestion)));
    });
  } else {
    // Proportional adjustment
    const ratio = targetSum / otherSum;
    otherQuestions.forEach(q => {
      q.value = Math.max(MIN, Math.min(MAX, Math.round(q.value * ratio)));
    });
  }
  
  // Fine-tune to exact total
  const finalSum = questions.reduce((sum, q) => sum + q.value, 0);
  const diff = TOTAL - finalSum;
  if (diff !== 0) {
    // Apply remainder to first adjustable question
    const adjustable = otherQuestions.find(q => 
      (diff > 0 && q.value < MAX) || (diff < 0 && q.value > MIN)
    );
    if (adjustable) adjustable.value += diff;
  }
  
  return questions;
}
```

## State Management

```typescript
interface AssessmentState {
  mode: 'questions' | 'override';
  measures: {
    tree: {
      questions: Question[] | null;  // null in override mode
      override: number | null;        // null in questions mode
      computed: number;               // final 1-99 value
    };
    bucketLevel: {...};
    bucketThickness: {...};
    inputPipe: {...};
    outputPipe: {...};
  };
  constraints: {
    questionsPerMeasure: number;
    sumPerMeasure: number;
  };
}
```

## Visual Feedback

### Color Zones
- **1-24**: Deep purple (Root)
- **25-49**: Brown (Trunk)  
- **50-74**: Green (Branch)
- **75-99**: Light green (Leaf)

### Constraint Indicators
- **Green check**: Sum is correct (e.g., 250/250)
- **Red warning**: Sum exceeded (auto-adjusting)
- **Yellow caution**: Extreme values (approaching 1 or 99)

## Mobile Responsiveness

### Desktop (>768px)
- Horizontal tabs
- Side-by-side sliders
- Tooltips on hover

### Mobile (<768px)
- Vertical accordion tabs
- Stack sliders vertically
- Tap for tooltips
- Larger touch targets (44px minimum)

## Accessibility

- **Keyboard Navigation**: Tab through all controls
- **Screen Readers**: Announce current value and zone
- **Color Blind**: Use patterns/icons not just color
- **Focus Indicators**: Clear outline on active element
- **ARIA Labels**: Descriptive labels for all inputs

## Data Flow

```
User Input → Mode Check → 
  ├── Question Mode → Constraint Engine → State Update
  └── Override Mode → Direct State Update
                            ↓
                     Calculate Results → 
                            ↓
                     Store Assessment →
                            ↓
                     Navigate to Results
```

## Key Features

1. **Real-time Constraint Balancing**: As you adjust one question, others auto-adjust
2. **Zone Visualization**: See which Tree type/zone you're in as you drag
3. **Mode Memory**: Remember user's preferred mode for next visit
4. **Partial Save**: Can save incomplete assessments as drafts
5. **Reset Options**: Reset current tab or entire assessment
6. **Tooltips**: Explanations for each measure on hover/tap

## Technical Implementation Notes

- Use `framer-motion` for smooth slider animations
- Implement `useDeferredValue` for responsive constraint calculations
- Store mode preference in localStorage
- Use optimistic updates for instant feedback
- Debounce saves to prevent excessive API calls