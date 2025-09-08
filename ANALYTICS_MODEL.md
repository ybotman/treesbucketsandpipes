# TBAP Analytics Model

## The 5 Core Measures → Analytics Pipeline

### Input: Raw Scores (1-99 scale)
1. **Tree Position**: 1-99 (maps to Root/Trunk/Branch/Leaf zones)
2. **Bucket Level**: 1-99 (gut trust)
3. **Bucket Thickness**: 1-99 (resilience)
4. **Input Pipe**: 1-99 (learning width)
5. **Output Pipe**: 1-99 (sharing width)

### Transformation: Convert to 1-10 Scale
```javascript
const to10Scale = (value99) => Math.ceil(value99 / 10);
```

## Analytics Outputs

### 1. Primary Tree Type & Position
```javascript
const getTreeType = (treeScore) => {
  if (treeScore <= 24) return { type: 'root', zone: 'pure' };
  if (treeScore <= 37) return { type: 'root', zone: 'root-trunk' };
  if (treeScore <= 49) return { type: 'trunk', zone: 'trunk-root' };
  if (treeScore <= 62) return { type: 'trunk', zone: 'pure' };
  if (treeScore <= 74) return { type: 'branch', zone: 'branch-trunk' };
  if (treeScore <= 87) return { type: 'branch', zone: 'pure' };
  if (treeScore <= 99) return { type: 'leaf', zone: 'leaf-branch' };
};
```

### 2. Interaction Archetype (Tree + Output Pipe)
```javascript
const getArchetype = (treeScore, outputPipe) => {
  const treeType = getTreeType(treeScore).type;
  const isPeopleOriented = ['root', 'leaf'].includes(treeType);
  const isFactOriented = ['trunk', 'branch'].includes(treeType);
  const isWideOutput = outputPipe > 50; // 50+ on 1-99 scale
  
  if (isPeopleOriented && !isWideOutput) return 'Harmonious Nurturer';
  if (isPeopleOriented && isWideOutput) return 'Inspiring Connector';
  if (isFactOriented && !isWideOutput) return 'Grounded Analyst';
  if (isFactOriented && isWideOutput) return 'Impactful Driver';
};
```

### 3. Decision Profile (Bucket Level + Thickness)
```javascript
const getDecisionProfile = (level, thickness) => {
  const levelCategory = level <= 33 ? 'external' : level <= 66 ? 'balanced' : 'gut';
  const thicknessCategory = thickness <= 33 ? 'fragile' : thickness <= 66 ? 'moderate' : 'durable';
  
  return {
    trust: levelCategory,
    resilience: thicknessCategory,
    profile: `${levelCategory}-${thicknessCategory}`
  };
};
```

### 4. Learning & Sharing Profile (Pipes)
```javascript
const getPipeProfile = (input, output) => {
  const inputWidth = input <= 33 ? 'narrow' : input <= 66 ? 'moderate' : 'wide';
  const outputWidth = output <= 33 ? 'narrow' : output <= 66 ? 'moderate' : 'wide';
  
  return {
    learning: inputWidth,
    sharing: outputWidth,
    style: `${inputWidth}-in-${outputWidth}-out`
  };
};
```

## Complete Analytics Schema

```json
{
  "assessment": {
    "id": "uuid",
    "timestamp": "ISO-8601",
    "rawScores": {
      "tree": 62,           // 1-99
      "bucketLevel": 75,    // 1-99
      "bucketThickness": 45, // 1-99
      "inputPipe": 30,      // 1-99
      "outputPipe": 85      // 1-99
    },
    "normalizedScores": {
      "tree": 6.2,          // 1-10
      "bucketLevel": 7.5,   // 1-10
      "bucketThickness": 4.5, // 1-10
      "inputPipe": 3.0,     // 1-10
      "outputPipe": 8.5     // 1-10
    },
    "analytics": {
      "treeProfile": {
        "primary": "branch",
        "secondary": "trunk",
        "zone": "branch-trunk",
        "position": 62,
        "quadrant": "fact-oriented"
      },
      "interactionArchetype": {
        "name": "Impactful Driver",
        "quadrant": "fact-wide",
        "description": "Fact-focused with wide sharing",
        "strengths": ["Results-driven", "Persuasive", "Strategic"],
        "challenges": ["May overwhelm others", "Can seem pushy"]
      },
      "decisionProfile": {
        "trustLevel": "gut",
        "resilience": "moderate",
        "profile": "gut-moderate",
        "description": "Trusts intuition but can be influenced under pressure"
      },
      "learningProfile": {
        "inputWidth": "narrow",
        "outputWidth": "wide",
        "style": "narrow-in-wide-out",
        "description": "Quick learner who shares extensively"
      },
      "combinedInsights": {
        "leadershipStyle": "Directive communicator",
        "teamRole": "Vision-setter and evangelist",
        "stressResponse": "Pushes harder on communication",
        "growthArea": "Gathering more input before sharing"
      }
    }
  }
}
```

## Visualization Components

### 1. Tree Circle Visualization
```jsx
<TreeCircle>
  <Ring zone="root" range={[1, 24]} />
  <Ring zone="trunk" range={[25, 49]} />
  <Ring zone="branch" range={[50, 74]} />
  <Ring zone="leaf" range={[75, 99]} />
  <UserBubble position={62} size="primary" />
  <BlendZone start={37} end={62} label="Trunk-Branch blend" />
</TreeCircle>
```

### 2. Archetype Quadrant Grid
```jsx
<ArchetypeGrid>
  <Quadrant 
    x="people" 
    y="narrow" 
    label="Harmonious Nurturer"
    active={false}
  />
  <Quadrant 
    x="people" 
    y="wide" 
    label="Inspiring Connector"
    active={false}
  />
  <Quadrant 
    x="fact" 
    y="narrow" 
    label="Grounded Analyst"
    active={false}
  />
  <Quadrant 
    x="fact" 
    y="wide" 
    label="Impactful Driver"
    active={true}
  />
  <UserDot x={75} y={85} />
</ArchetypeGrid>
```

### 3. Bucket Matrix (2D Grid)
```jsx
<BucketMatrix>
  <XAxis label="Trust Level" range={[1, 99]} />
  <YAxis label="Resilience" range={[1, 99]} />
  <Zone name="External-Fragile" bounds={[1,33,1,33]} />
  <Zone name="Balanced-Moderate" bounds={[34,66,34,66]} />
  <Zone name="Gut-Durable" bounds={[67,99,67,99]} />
  <UserPoint x={75} y={45} />
</BucketMatrix>
```

### 4. Pipes Flow Diagram
```jsx
<PipesFlow>
  <InputPipe width={30} label="Narrow Input" />
  <BucketContainer level={75} thickness={45} />
  <OutputPipe width={85} label="Wide Output" />
  <FlowAnimation speed="fast" volume="high" />
</PipesFlow>
```

### 5. Comprehensive Dashboard
```jsx
<AnalyticsDashboard>
  <SummaryCards>
    <Card title="Primary Type" value="Branch" />
    <Card title="Archetype" value="Impactful Driver" />
    <Card title="Decision Style" value="Gut-Moderate" />
    <Card title="Flow Style" value="Narrow-In Wide-Out" />
  </SummaryCards>
  
  <VisualizationGrid>
    <TreeCircle data={treeData} />
    <ArchetypeGrid data={archetypeData} />
    <BucketMatrix data={bucketData} />
    <PipesFlow data={pipesData} />
  </VisualizationGrid>
  
  <InsightsPanel>
    <Insight category="strengths" items={strengths} />
    <Insight category="challenges" items={challenges} />
    <Insight category="growth" items={growthAreas} />
  </InsightsPanel>
</AnalyticsDashboard>
```

## Calculation Functions

```javascript
// Master analytics calculator
export const calculateAnalytics = (rawScores) => {
  const { tree, bucketLevel, bucketThickness, inputPipe, outputPipe } = rawScores;
  
  // Normalize to 1-10
  const normalized = {
    tree: tree / 10,
    bucketLevel: bucketLevel / 10,
    bucketThickness: bucketThickness / 10,
    inputPipe: inputPipe / 10,
    outputPipe: outputPipe / 10
  };
  
  // Calculate profiles
  const treeProfile = getTreeProfile(tree);
  const archetype = getArchetype(tree, outputPipe);
  const decisionProfile = getDecisionProfile(bucketLevel, bucketThickness);
  const learningProfile = getPipeProfile(inputPipe, outputPipe);
  
  // Generate insights
  const insights = generateInsights(treeProfile, archetype, decisionProfile, learningProfile);
  
  return {
    rawScores,
    normalized,
    analytics: {
      treeProfile,
      interactionArchetype: archetype,
      decisionProfile,
      learningProfile,
      combinedInsights: insights
    }
  };
};
```

## Insight Generation Rules

```javascript
const generateInsights = (tree, archetype, decision, learning) => {
  const insights = {
    leadershipStyle: '',
    teamRole: '',
    stressResponse: '',
    growthArea: ''
  };
  
  // Leadership style based on archetype
  const leadershipMap = {
    'Harmonious Nurturer': 'Supportive facilitator',
    'Inspiring Connector': 'Charismatic motivator',
    'Grounded Analyst': 'Data-driven advisor',
    'Impactful Driver': 'Directive communicator'
  };
  insights.leadershipStyle = leadershipMap[archetype.name];
  
  // Team role based on tree + pipes
  if (tree.primary === 'root') insights.teamRole = 'Culture keeper';
  if (tree.primary === 'trunk') insights.teamRole = 'Process optimizer';
  if (tree.primary === 'branch') insights.teamRole = 'Goal achiever';
  if (tree.primary === 'leaf') insights.teamRole = 'Innovation catalyst';
  
  // Stress response based on bucket
  if (decision.resilience === 'fragile') {
    insights.stressResponse = 'Seeks external validation';
  } else if (decision.resilience === 'durable') {
    insights.stressResponse = 'Doubles down on intuition';
  } else {
    insights.stressResponse = 'Balances input with gut feel';
  }
  
  // Growth areas based on extremes
  const extremes = [];
  if (learning.inputWidth === 'narrow') extremes.push('Gather more perspectives');
  if (learning.inputWidth === 'wide') extremes.push('Trust initial instincts more');
  if (learning.outputWidth === 'narrow') extremes.push('Share insights more openly');
  if (learning.outputWidth === 'wide') extremes.push('Listen before broadcasting');
  
  insights.growthArea = extremes.join(', ') || 'Maintain balanced approach';
  
  return insights;
};
```

## Color Coding System

```javascript
const COLORS = {
  tree: {
    root: '#8B4789',   // Deep purple
    trunk: '#8B6B47',  // Brown
    branch: '#4A7C59', // Forest green  
    leaf: '#8FBC8F'    // Light green
  },
  archetype: {
    'Harmonious Nurturer': '#E6B8D8',
    'Inspiring Connector': '#FFB6C1',
    'Grounded Analyst': '#B8D8E6',
    'Impactful Driver': '#90EE90'
  },
  bucket: {
    fragile: '#FFE4E1',
    moderate: '#F0E68C',
    durable: '#98FB98'
  },
  pipes: {
    narrow: '#D3D3D3',
    moderate: '#87CEEB',
    wide: '#4682B4'
  }
};
```

## API Endpoints

```typescript
// GET /api/analytics/:assessmentId
interface AnalyticsResponse {
  assessment: Assessment;
  analytics: Analytics;
  comparisons?: TeamComparison[];
}

// POST /api/analytics/calculate
interface CalculateRequest {
  rawScores: {
    tree: number;        // 1-99
    bucketLevel: number; // 1-99
    bucketThickness: number; // 1-99
    inputPipe: number;   // 1-99
    outputPipe: number;  // 1-99
  };
}

// GET /api/analytics/team/:teamId
interface TeamAnalytics {
  teamId: string;
  members: Assessment[];
  distribution: {
    trees: Record<TreeType, number>;
    archetypes: Record<Archetype, number>;
  };
  dynamics: {
    compatibility: number; // 0-100
    gaps: string[];
    strengths: string[];
  };
}
```