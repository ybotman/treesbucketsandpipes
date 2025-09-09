# TBAP Assessment System Design

## Overview
The Trees, Buckets, and Pipes (TBAP) assessment system evaluates individuals across 5 key measures to create a comprehensive personality/working style profile. All measures use a 1-99 scale.

## The 5 Measures

### 1. Tree (Complex Calculation)
- **Questions**: 15+ questions (3-4 per pure type)
- **Scale**: 1-99 (derived from bell curve peak)
- **Pure Types**: Root, Trunk, Branch, Leaf
- **Subtypes**: 8 total (Root, Root-Trunk, Trunk, Trunk-Branch, Branch, Branch-Leaf, Leaf, Leaf-Root)

### 2. Bucket
- **Questions**: 3 questions
- **Scale**: 1-99
- **Calculation**: Average of question responses

### 3. Thickness
- **Questions**: 3 questions
- **Scale**: 1-99
- **Calculation**: Average of question responses

### 4. Input
- **Questions**: 3 questions
- **Scale**: 1-99
- **Calculation**: Average of question responses

### 5. Output
- **Questions**: 3 questions
- **Scale**: 1-99
- **Calculation**: Average of question responses

## Tree Type Calculation (Vector-Based Compass Model)

### Step 1: Collect Responses
- Present 15+ questions randomly mixed (no type labels shown)
- Each question maps to one of 4 pure types
- Users answer on a scale (e.g., 1-7 Likert scale)

### Step 2: Calculate Pure Type Scores
- Group responses by pure type
- Calculate average for each pure type (1-99 scale):
  - Root Average
  - Trunk Average
  - Branch Average
  - Leaf Average

### Step 3: Vector Calculation (Compass Model)
The 4 types map to compass directions:
- **Root**: 0° (East)
- **Trunk**: 90° (North)
- **Branch**: 180° (West)
- **Leaf**: 270° (South)

Calculate resultant vector:
1. Convert each score to vector components:
   - `x = score × cos(angle)`
   - `y = score × sin(angle)`
2. Sum all vectors to get net direction
3. Calculate angle of resultant vector → position (1-99)
4. Calculate magnitude → strength/purity

### Step 4: Determine Tree Type & Strength
- **Position** (1-99): Maps to 8 subtypes
  - 1-12: Root
  - 13-24: Root-Trunk
  - 25-37: Trunk
  - 38-49: Trunk-Branch
  - 50-62: Branch
  - 63-74: Branch-Leaf
  - 75-87: Leaf
  - 88-99: Leaf-Root
- **Strength**: Indicates pure vs. blended type
  - High strength (>70): Clear dominant type
  - Medium (40-70): Moderate blend
  - Low (<40): Highly blended/flexible

## Question Structure

### Tree Questions (15+)
Each pure type has 3-4 questions focusing on core motivations:

#### Root Type Questions (Harmony/Belonging/Connection)
- Focus on: peacekeeping, inclusion, tension resolution, connection
- Example: "I feel responsible for keeping peace and harmony between people"

#### Trunk Type Questions (Mastery/Growth/Self-Improvement)
- Focus on: skill development, discipline, deep knowledge, persistence
- Example: "I am motivated by a desire to become stronger, more skilled, or more capable"

#### Branch Type Questions (Impact/Contribution/Legacy)
- Focus on: system impact, lasting difference, broader influence, legacy
- Example: "I think about how my actions affect the larger system or community"

#### Leaf Type Questions (Novelty/Discovery/Exploration)
- Focus on: new experiences, change, experimentation, fresh starts
- Example: "I feel energized by new ideas, experiences, or changes"

### Other Measure Questions (12 total)
- **Bucket**: 3 questions about capacity/depth
- **Thickness**: 3 questions about resilience/boundaries
- **Input**: 3 questions about information gathering style
- **Output**: 3 questions about expression/action style

## User Interface Design

### Three-Tab System

#### Tab 1: Questions
- **Display**: All 27+ questions in random order
- **Format**: Likert scale (1-5 or 1-7)
- **No visible categorization** (types hidden from user)
- **Progress indicator**: Shows completion status
- **Calculate button**: Computes scores when complete

#### Tab 2: Manual Override
- **5 Sliders**: Each 1-99 scale
  - Tree (with subtype indicator)
  - Bucket
  - Thickness
  - Input
  - Output
- **Description**: Brief explanation of each measure
- **Visual feedback**: Real-time position display

#### Tab 3: Summary
- **Score Display**: Shows final scores (question-based OR manual)
- **Source Indicator**: Shows if score is from questions or manual
- **Tree Subtype**: Visual representation of position on tree spectrum
- **Paraphrase Generation**: Combines all 5 measures into unified description
- **Profile Archetype**: Generated from score combination

## Data Storage

### questions.json
```json
{
  "questions": [
    {
      "id": "tree_root_1",
      "text": "I feel responsible for keeping peace and harmony...",
      "measure": "tree",
      "subtype": "root",
      "order": null  // randomized on display
    },
    // ... all questions
  ]
}
```

### descriptions.json
```json
{
  "tree_subtypes": {
    "root": "Deep connection to community and harmony...",
    "root_trunk": "Balances connection with personal growth...",
    // ... all 8 subtypes
  },
  "measures": {
    "bucket": {
      "low": "Prefers focused, deep engagement...",
      "medium": "Balances depth and breadth...",
      "high": "Embraces wide-ranging experiences..."
    },
    // ... all measures
  }
}
```

## Scoring Logic

### Question-Based Scoring
1. User completes all questions
2. System calculates:
   - Tree: Bell curve peak from 4 pure type averages
   - Others: Direct average of responses (scaled to 1-99)
3. Stores both raw and calculated scores

### Manual Override
1. User adjusts sliders (1-99)
2. Overrides question-based scores
3. Summary uses manual values when set

### Summary Generation
1. Takes final scores (question or manual)
2. Maps Tree score to subtype
3. Maps other scores to descriptions
4. Combines into cohesive paraphrase
5. Identifies profile archetype pattern

## Technical Implementation

### State Management
```typescript
interface AssessmentState {
  questionResponses: Map<string, number>;
  manualScores: {
    tree?: number;
    bucket?: number;
    thickness?: number;
    input?: number;
    output?: number;
  };
  calculatedScores: {
    tree: number;
    treeSubtype: string;
    bucket: number;
    thickness: number;
    input: number;
    output: number;
  };
  activeTab: 'questions' | 'manual' | 'summary';
  scoreSource: 'questions' | 'manual';
}
```

### Vector-Based Tree Calculation
```typescript
function calculateTreeScore(scores: {
  root: number;
  trunk: number;
  branch: number;
  leaf: number;
}): {
  score: number;
  strength: number;
  subtype: string;
} {
  const radians = (deg: number) => (deg * Math.PI) / 180;
  
  const angleMap = {
    root: radians(0),
    trunk: radians(90),
    branch: radians(180),
    leaf: radians(270),
  };
  
  let x = 0;
  let y = 0;
  
  // Vector addition
  for (const [type, score] of Object.entries(scores)) {
    const angle = angleMap[type as keyof typeof angleMap];
    x += score * Math.cos(angle);
    y += score * Math.sin(angle);
  }
  
  // Calculate angle and strength
  const angle = Math.atan2(y, x);
  const strength = Math.sqrt(x * x + y * y);
  
  // Convert angle to degrees (0-360)
  let degrees = (angle * 180) / Math.PI;
  if (degrees < 0) degrees += 360;
  
  // Map to 1-99 scale
  const score = Math.round((degrees / 360) * 99) + 1;
  
  // Determine subtype
  const subtype = getTreeSubtype(score);
  
  return { score, strength, subtype };
}
```

## Visual Design

### Color Coding
- Tree subtypes: Gradient from earth tones (Root) to bright greens (Leaf)
- Bucket: Blue spectrum (depth)
- Thickness: Orange spectrum (boundaries)
- Input: Purple spectrum (receptivity)
- Output: Red spectrum (expression)

### Progress Indicators
- Question completion: Progress bar
- Manual sliders: Real-time value display
- Summary: Radar chart or visual profile

## Interaction Model

### People vs. Solo Scale Mapping
The Tree score (1-99) maps to a People/Solo orientation scale:

#### Mapping Logic
- **1-25**: Strong PEOPLE orientation (Root zone)
- **26-49**: Moderate PEOPLE to SOLO transition
- **50**: Maximum SOLO (Trunk-Branch boundary)
- **51-74**: Moderate SOLO to PEOPLE transition  
- **75-99**: Strong PEOPLE orientation (Leaf zone)

This creates a U-shaped curve where:
- **Ends of tree** (Root/Leaf): People-focused
- **Middle of tree** (Trunk/Branch): Fact/Solo-focused

### Interaction Archetypes (2x2 Grid)
Combining People/Solo orientation with Output measure:

#### Dimensions
1. **X-Axis**: Tree-derived People vs. Fact orientation
   - People-Oriented: Root (1-25) and Leaf (75-99)
   - Fact-Oriented: Trunk (26-49) and Branch (50-74)

2. **Y-Axis**: Output Pipe (1-99)
   - Narrow Output (1-49): Shares rarely, only when asked
   - Wide Output (50-99): Shares frequently, feels urgent need to explain

#### The Four Archetypes

|                | **Narrow Output (1-49)** | **Wide Output (50-99)** |
|----------------|---------------------------|-------------------------|
| **People-Oriented** | 🌱 Harmonious Nurturer | 🌟 Inspiring Connector |
| **Fact-Oriented** | 📊 Grounded Analyst | 🎯 Impactful Driver |

#### Archetype Descriptions

**🌱 Harmonious Nurturer** (People + Narrow)
- Quietly maintains group harmony
- Supports others behind the scenes
- Shares insights when directly asked
- Values deep, trusted relationships

**🌟 Inspiring Connector** (People + Wide)
- Actively builds community and connection
- Enthusiastically shares experiences
- Motivates through stories and energy
- Creates inclusive environments

**📊 Grounded Analyst** (Fact + Narrow)
- Focuses on accuracy and depth
- Shares expertise when consulted
- Values precision over volume
- Builds credibility through consistency

**🎯 Impactful Driver** (Fact + Wide)
- Pushes for results and action
- Communicates goals and expectations clearly
- Influences through data and logic
- Drives change through persistent messaging

### Calculation Flow

```typescript
function calculateInteractionArchetype(treeScore: number, outputScore: number): {
  orientation: 'people' | 'fact';
  expression: 'narrow' | 'wide';
  archetype: string;
} {
  // Map tree score to people/fact orientation
  const orientation = getPeopleFactOrientation(treeScore);
  
  // Map output score to expression level
  const expression = outputScore < 50 ? 'narrow' : 'wide';
  
  // Determine archetype
  const archetype = getArchetype(orientation, expression);
  
  return { orientation, expression, archetype };
}

function getPeopleFactOrientation(treeScore: number): 'people' | 'fact' {
  // U-shaped curve mapping
  if (treeScore <= 25 || treeScore >= 75) {
    return 'people'; // Root or Leaf zones
  } else {
    return 'fact'; // Trunk or Branch zones
  }
}
```

### Visual Representation

#### Tree to People/Solo Mapping
```
Tree Score:  1 -------- 25 -------- 50 -------- 75 -------- 99
             Root      Trunk    Trunk-Branch   Leaf      Leaf-Root
People/Solo: PEOPLE ← → → → → SOLO ← → → → → PEOPLE
```

#### Interaction Grid Display
- Show user's position on 2x2 grid
- Highlight their archetype quadrant
- Display archetype description
- Show distance from quadrant boundaries (for edge cases)

### Integration with Summary Tab
The Summary tab will now include:
1. **Primary Scores** (5 measures)
2. **Tree Subtype** visualization
3. **People/Solo Orientation** derived from Tree
4. **Interaction Archetype** (from Tree + Output)
5. **Full Profile Paraphrase** combining all elements

## Collaboration Fit (Future Enhancement)
The Interaction Archetypes enable team dynamics analysis:
- Compare two or more profiles
- Identify natural collaboration patterns
- Highlight potential friction points
- Suggest communication strategies

## Future Enhancements
1. Save/load profiles
2. Compare multiple profiles
3. Team analysis (aggregate profiles)
4. Collaboration Fit analysis between archetypes
5. Detailed recommendations based on type
6. Historical tracking of changes
7. Export results (PDF/JSON)
8. API for integration with other tools