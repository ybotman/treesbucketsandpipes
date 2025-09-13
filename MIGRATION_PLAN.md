# Migration Plan: Manual Page to Data-Driven Labels

## Overview
This document outlines the migration from hardcoded labels and descriptions to a data-driven approach using `measures_complete.json`.

## New JSON Structure Created
- **File**: `/src/data/measures_complete.json`
- **Purpose**: Centralize all measure labels, descriptions, and band configurations

## JSON Structure Features

### For Each Measure (bucket, thickness, input, output):
- `displayName`: Primary label (e.g., "Bucket")
- `altName`: Alternative/clarifying label (e.g., "Gut / Confidence")
- `shortDescription`: One-line description for UI display
- `fullDescription`: Detailed explanation for tooltips/help
- `userLabel`: User-friendly label (e.g., "Your Decision Style")
- `scaleLabels`: Left/right labels for slider endpoints
- `bands`: Array of range bands with:
  - `range`: Numeric range [min, max]
  - `rangeLabel`: Display string (e.g., "1-30")
  - `title`: Band title
  - `shortDesc`: Brief band description
  - `fullDesc`: Complete band description
  - `color`: Background color for visual distinction

### For Tree (special circular measure):
- All standard fields plus:
- `scale`: Min/max/circular configuration
- `subtypes`: 8 Tree subtypes with ranges and positions

## Migration Steps

### 1. Update ProfessionalSlider Component
**File**: `/src/components/ProfessionalSlider.tsx`

**Changes Required**:
- Remove hardcoded `getRangeBands()` function (lines 97-127)
- Accept `measureData` prop with complete measure configuration
- Use data-driven bands from JSON
- Update render to use `measureData.bands` instead of hardcoded values

### 2. Update Manual Assessment Page
**File**: `/src/app/assess/page.tsx`

**Changes Required**:
- Import `measures_complete.json`
- Remove hardcoded labels and descriptions (lines 505-552)
- Pass measure data to ProfessionalSlider components
- Example:
```tsx
import measuresData from '@/data/measures_complete.json';

// In render:
<ProfessionalSlider
  measureData={measuresData.measures.bucket}
  value={manualScores.bucket}
  onChange={(value) => handleManualScoreChange('bucket', value)}
  min={1}
  max={100}
  color="#5B8BA0"
/>
```

### 3. Update CircularSlider Component
**File**: `/src/components/CircularSlider.tsx`

**Changes Required**:
- Accept `treeData` prop with Tree configuration
- Use data-driven subtypes instead of hardcoded values
- Update `getSubtypeLabel()` to use `treeData.subtypes`

### 4. Benefits of Migration

#### Immediate Benefits:
- Single source of truth for all labels and descriptions
- Easy to update text without touching code
- Consistent terminology across the application
- Supports A/B testing of different descriptions

#### Future Enhancements:
- Internationalization support (add language keys)
- Dynamic band configurations (different ranges per user type)
- Server-side configuration updates
- Personalized descriptions based on user profile

## Implementation Priority

1. **Phase 1**: Update ProfessionalSlider to use JSON data
2. **Phase 2**: Update Manual page to pass data to sliders
3. **Phase 3**: Update CircularSlider for Tree data
4. **Phase 4**: Remove all hardcoded text from components

## Testing Checklist

- [ ] All sliders display correct labels from JSON
- [ ] Band ranges highlight correctly based on value
- [ ] Descriptions appear in correct locations
- [ ] Scale labels (left/right) display properly
- [ ] Tree subtypes calculate correctly with new ranges
- [ ] No hardcoded text remains in components

## Rollback Plan

If issues arise:
1. Keep original hardcoded functions commented
2. Add feature flag to toggle between old/new approach
3. Maintain backward compatibility during transition

## Next Steps

After this migration:
1. Consider adding user preference overrides
2. Implement tooltip/help system using fullDescription
3. Add animation transitions between bands
4. Consider responsive text for mobile vs desktop