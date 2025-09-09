# TBAP Implementation Plan - Step by Step

## Phase 1: Data Foundation (Start Here)
### Step 1.1: Create Questions Data Structure
- [ ] Create `/src/data/questions.json` with all questions
  - 15+ Tree questions (3-4 per pure type: Root, Trunk, Branch, Leaf)
  - 3 Bucket questions
  - 3 Thickness questions  
  - 3 Input questions
  - 3 Output questions
- [ ] Each question needs: id, text, measure, subtype (for tree), scale

### Step 1.2: Create Descriptions Data
- [ ] Create `/src/data/descriptions.json`
  - 8 Tree subtype descriptions
  - Range descriptions for other 4 measures (low/medium/high)
  - Interaction archetype descriptions

## Phase 2: Core Calculation Logic
### Step 2.1: Basic Score Calculations
- [ ] Create `/src/lib/calculations.ts`
- [ ] Implement simple average for Bucket, Thickness, Input, Output
- [ ] Scale Likert responses (1-7) to 1-99 scale

### Step 2.2: Tree Bell Curve Calculation (Complex Part)
- [ ] Calculate averages for each pure type (Root, Trunk, Branch, Leaf)
- [ ] Generate bell curve from 4 data points
- [ ] Find peak of curve (1-99 position)
- [ ] Map peak to 8 subtypes

### Step 2.3: Interaction Model
- [ ] Map Tree score to People/Solo orientation (U-shaped curve)
- [ ] Combine with Output score for 2x2 archetype grid
- [ ] Return archetype classification

## Phase 3: UI Components (Simplest First)
### Step 3.1: Manual Override Tab (Easiest)
- [ ] Create 5 sliders (1-99 scale)
- [ ] Real-time value display
- [ ] Save manual scores to state

### Step 3.2: Questions Tab
- [ ] Display all questions in random order
- [ ] Likert scale inputs (1-7)
- [ ] Progress indicator
- [ ] Calculate button
- [ ] Save responses to state

### Step 3.3: Summary Tab
- [ ] Display 5 measure scores
- [ ] Show Tree subtype
- [ ] Show Interaction Archetype
- [ ] Display relevant descriptions
- [ ] Indicate if scores are from questions or manual

## Phase 4: State Management
### Step 4.1: Assessment State
- [ ] Question responses storage
- [ ] Manual override storage
- [ ] Calculated scores storage
- [ ] Active tab tracking
- [ ] Score source tracking (questions vs manual)

## Phase 5: Integration & Polish
### Step 5.1: Connect Everything
- [ ] Wire up tab navigation
- [ ] Ensure state persists across tabs
- [ ] Add validation
- [ ] Add reset functionality

### Step 5.2: Visual Enhancements
- [ ] Tree position visualization
- [ ] Interaction archetype grid
- [ ] Color coding for measures
- [ ] Smooth transitions

## Complexity Analysis & Approach

### Simple Parts (Do First):
1. **Manual sliders** - Just 5 range inputs
2. **Basic averages** - Simple math for 4 measures
3. **Question display** - Just rendering JSON data

### Medium Complexity:
1. **State management** - Need to track multiple sources
2. **Tab system** - Standard UI pattern
3. **Score scaling** - Linear transformation (1-7 → 1-99)

### Complex Parts (Do Last):
1. **Bell curve calculation** - Need algorithm for curve fitting
2. **Tree subtype mapping** - Peak detection and zone mapping
3. **Interaction model** - Two-dimensional classification

## Suggested Order of Implementation:

### Day 1: Foundation
1. Create JSON data files (questions & descriptions)
2. Build Manual Override tab with 5 sliders
3. Set up basic state management

### Day 2: Questions & Basic Scoring
1. Build Questions tab UI
2. Implement simple averaging for 4 measures
3. Connect questions to state

### Day 3: Tree Calculation
1. Implement bell curve algorithm
2. Test with sample data
3. Map peaks to subtypes

### Day 4: Integration
1. Build Summary tab
2. Add Interaction Archetype logic
3. Connect all pieces

### Day 5: Polish
1. Add visualizations
2. Improve UX
3. Test edge cases

## Key Decisions Needed:

1. **Question Scale**: Use 1-7 Likert? Or 1-5? Or direct 1-99?
2. **Bell Curve Algorithm**: Use normal distribution? Polynomial fitting?
3. **State Persistence**: Local storage? Session only?
4. **Randomization**: Shuffle questions each time? Or fixed random order?
5. **Validation**: Require all questions? Allow partial completion?

## Risk Mitigation:

### For Bell Curve Complexity:
- **Fallback**: Start with weighted average of pure types
- **Simplification**: Use predetermined curve shapes
- **Alternative**: Use simple zone mapping without curve

### For Too Many Questions:
- **Progressive disclosure**: Show 5 questions at a time
- **Quick mode**: Fewer questions with less accuracy
- **Save progress**: Allow resuming later

## Testing Strategy:

1. **Unit tests** for calculations
2. **Edge cases**: All same answers, extreme values
3. **User flow**: Complete assessment multiple ways
4. **Visual QA**: Check all archetype combinations

## Next Immediate Steps:

1. ✅ Review this plan
2. Start with Phase 1.1 - Create questions.json
3. Build Manual Override tab (quick win)
4. Test basic state management
5. Iterate from there

---

**Remember**: Start simple, test often, iterate. The complex Tree calculation can be refined over time - get a working version first, optimize later.