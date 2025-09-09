import descriptions from '@/data/descriptions.json';

// Types
export interface TreeScores {
  root: number;
  trunk: number;
  branch: number;
  leaf: number;
}

export interface TreeResult {
  score: number;        // 1-99 position on circle
  strength: number;     // Magnitude of vector (purity of type)
  subtype: string;      // One of 8 subtypes
  subtypeName: string;  // Human readable name
}

export interface AssessmentScores {
  tree: TreeResult;
  bucket: number;
  thickness: number;
  input: number;
  output: number;
}

export interface InteractionArchetype {
  orientation: 'people' | 'fact';
  expression: 'narrow' | 'wide';
  archetype: string;
  archetypeName: string;
  description: string;
}

// Calculate average score (already in 1-99 scale)
export function calculateMeasureScore(responses: number[]): number {
  if (responses.length === 0) return 50; // Default to middle
  const average = responses.reduce((sum, val) => sum + val, 0) / responses.length;
  return Math.round(average);
}

// Vector-based Tree calculation
export function calculateTreeScore(scores: TreeScores): TreeResult {
  const radians = (deg: number) => (deg * Math.PI) / 180;
  
  // Map types to compass angles
  const angleMap = {
    root: radians(0),     // East
    trunk: radians(90),   // North
    branch: radians(180), // West
    leaf: radians(270),   // South
  };
  
  let x = 0;
  let y = 0;
  
  // Vector addition - each type pulls in its direction
  for (const [type, score] of Object.entries(scores)) {
    const angle = angleMap[type as keyof typeof angleMap];
    x += score * Math.cos(angle);
    y += score * Math.sin(angle);
  }
  
  // Calculate resultant angle and strength
  const angle = Math.atan2(y, x);
  const strength = Math.sqrt(x * x + y * y);
  
  // Convert angle to degrees (0-360)
  let degrees = (angle * 180) / Math.PI;
  if (degrees < 0) degrees += 360;
  
  // Map degrees to 1-99 scale (circular mapping)
  const score = Math.round((degrees / 360) * 98) + 1;
  
  // Determine subtype based on score
  const subtype = getTreeSubtype(score);
  const subtypeData = descriptions.treeSubtypes[subtype as keyof typeof descriptions.treeSubtypes];
  
  // Normalize strength to 0-100 scale
  // Max possible strength is when all 4 scores are 99 in same direction = 99 * 2 = 198
  // More realistic max is around 99 * sqrt(2) ≈ 140 for adjacent types
  const normalizedStrength = Math.min(100, (strength / 140) * 100);
  
  return {
    score,
    strength: Math.round(normalizedStrength),
    subtype,
    subtypeName: subtypeData.name
  };
}

// Map Tree score to subtype
export function getTreeSubtype(score: number): string {
  const subtypes = [
    { key: 'root', range: [1, 12] },
    { key: 'root_trunk', range: [13, 24] },
    { key: 'trunk', range: [25, 37] },
    { key: 'trunk_branch', range: [38, 49] },
    { key: 'branch', range: [50, 62] },
    { key: 'branch_leaf', range: [63, 74] },
    { key: 'leaf', range: [75, 87] },
    { key: 'leaf_root', range: [88, 99] }
  ];
  
  const subtype = subtypes.find(s => score >= s.range[0] && score <= s.range[1]);
  return subtype?.key || 'root';
}

// Get People vs Fact orientation from Tree score
export function getPeopleFactOrientation(treeScore: number): 'people' | 'fact' {
  // U-shaped curve: ends are People, middle is Fact
  if (treeScore <= 25 || treeScore >= 75) {
    return 'people'; // Root or Leaf zones
  } else {
    return 'fact'; // Trunk or Branch zones
  }
}

// Calculate Interaction Archetype
export function calculateInteractionArchetype(
  treeScore: number,
  outputScore: number
): InteractionArchetype {
  const orientation = getPeopleFactOrientation(treeScore);
  const expression = outputScore < 50 ? 'narrow' : 'wide';
  
  // Map to archetype
  let archetypeKey = '';
  if (orientation === 'people' && expression === 'narrow') {
    archetypeKey = 'harmonious_nurturer';
  } else if (orientation === 'people' && expression === 'wide') {
    archetypeKey = 'inspiring_connector';
  } else if (orientation === 'fact' && expression === 'narrow') {
    archetypeKey = 'grounded_analyst';
  } else {
    archetypeKey = 'impactful_driver';
  }
  
  const archetypeData = descriptions.interactionArchetypes[
    archetypeKey as keyof typeof descriptions.interactionArchetypes
  ];
  
  return {
    orientation,
    expression,
    archetype: archetypeKey,
    archetypeName: archetypeData.name,
    description: archetypeData.description
  };
}

// Get description for a measure value
export function getMeasureDescription(measure: string, value: number): string {
  const measureData = descriptions.measures[measure as keyof typeof descriptions.measures];
  if (!measureData) return '';
  
  for (const level of ['low', 'medium', 'high']) {
    const range = measureData[level as keyof typeof measureData];
    if (value >= range.range[0] && value <= range.range[1]) {
      return range.description;
    }
  }
  
  return '';
}

// Get strength description
export function getStrengthDescription(strength: number): {
  label: string;
  description: string;
} {
  for (const level of ['high', 'medium', 'low']) {
    const desc = descriptions.strengthDescriptions[level as keyof typeof descriptions.strengthDescriptions];
    if (strength >= desc.range[0] && strength <= desc.range[1]) {
      return {
        label: desc.label,
        description: desc.description
      };
    }
  }
  
  return {
    label: 'Balanced',
    description: 'Your motivational pattern is balanced across types.'
  };
}

// Process all question responses into final scores
export function processQuestionResponses(
  responses: Map<string, number>,
  questions: any[]
): AssessmentScores {
  // Group responses by measure and subtype
  const treeResponses: { [key: string]: number[] } = {
    root: [],
    trunk: [],
    branch: [],
    leaf: []
  };
  
  const otherResponses: { [key: string]: number[] } = {
    bucket: [],
    thickness: [],
    input: [],
    output: []
  };
  
  // Sort responses into categories
  questions.forEach(q => {
    const response = responses.get(q.id);
    if (response !== undefined) {
      if (q.measure === 'tree' && q.subtype) {
        treeResponses[q.subtype].push(response);
      } else if (q.measure !== 'tree') {
        otherResponses[q.measure].push(response);
      }
    }
  });
  
  // Calculate Tree scores for each pure type
  const treeScores: TreeScores = {
    root: calculateMeasureScore(treeResponses.root),
    trunk: calculateMeasureScore(treeResponses.trunk),
    branch: calculateMeasureScore(treeResponses.branch),
    leaf: calculateMeasureScore(treeResponses.leaf)
  };
  
  // Calculate final Tree result using vector model
  const treeResult = calculateTreeScore(treeScores);
  
  // Calculate other measure scores
  return {
    tree: treeResult,
    bucket: calculateMeasureScore(otherResponses.bucket),
    thickness: calculateMeasureScore(otherResponses.thickness),
    input: calculateMeasureScore(otherResponses.input),
    output: calculateMeasureScore(otherResponses.output)
  };
}