'use client';

import { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Slider,
  Chip,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import { QuizOutlined, TuneOutlined, SaveOutlined, CalculateOutlined } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Building blocks for measure descriptions
const measureDescriptions = {
  tree: {
    'Leaf-Root': 'You bridge innovation with community, bringing creative solutions to human connections and exploring new ways to build harmony.',
    'Root': 'You are motivated by belonging, harmony, and creating deep connections with others.',
    'Root-Trunk': 'You blend relationship-building with systematic reliability and process improvement.',
    'Trunk': 'You are driven by mastery, growth, and building reliable systems that stand the test of time.',
    'Trunk-Branch': 'You combine systematic thinking with outcome-focused action and measurable impact.',
    'Branch': 'You are motivated by achieving tangible results, driving impact, and leaving a lasting legacy.',
    'Branch-Leaf': 'You blend results-orientation with creative innovation and exploratory thinking.',
    'Leaf': 'You thrive on novelty, discovery, and creative exploration of new possibilities.',
  },
  bucketLevel: {
    'External': 'You rely heavily on external data and validation before making decisions.',
    'Balanced': 'You balance intuitive insights with external information in your decision-making.',
    'Internal': 'You have strong trust in your gut feelings and internal compass.',
  },
  bucketThickness: {
    'Fragile': 'Your confidence can be easily influenced by challenges or opposing viewpoints.',
    'Moderate': 'You maintain reasonable flexibility while holding your ground when it matters.',
    'Durable': 'Your convictions remain steady even under significant pressure or criticism.',
  },
  inputPipe: {
    'Narrow': 'You prefer to act quickly with minimal information, trusting your instincts.',
    'Moderate': 'You gather a reasonable amount of information before making decisions.',
    'Wide': 'You conduct extensive research and seek comprehensive data before taking action.',
  },
  outputPipe: {
    'Narrow': 'You process internally and share selectively, preferring quiet influence.',
    'Moderate': 'You communicate when appropriate, balancing listening with sharing.',
    'Wide': 'You actively share ideas and insights, naturally teaching and evangelizing.',
  },
};

const measureConfig = {
  tree: {
    label: 'Tree',
    description: 'Motivation for Change',
    zones: [
      { min: 1, max: 6, label: 'Leaf-Root (A)', color: '#6B5B8C' },
      { min: 7, max: 12, label: 'Root', color: '#8B4789' },
      { min: 13, max: 25, label: 'Root-Trunk', color: '#8B5768' },
      { min: 26, max: 37, label: 'Trunk', color: '#8B6B47' },
      { min: 38, max: 50, label: 'Trunk-Branch', color: '#6A7550' },
      { min: 51, max: 62, label: 'Branch', color: '#4A7C59' },
      { min: 63, max: 75, label: 'Branch-Leaf', color: '#6CA074' },
      { min: 76, max: 87, label: 'Leaf', color: '#8FBC8F' },
      { min: 88, max: 99, label: 'Leaf-Root (B)', color: '#7DA589' },
    ],
  },
  bucketLevel: {
    label: 'Bucket Level',
    description: 'Trust in Gut',
    zones: [
      { min: 1, max: 33, label: 'External', color: '#FFE4E1' },
      { min: 34, max: 66, label: 'Balanced', color: '#F0E68C' },
      { min: 67, max: 99, label: 'Internal', color: '#98FB98' },
    ],
  },
  bucketThickness: {
    label: 'Bucket Thickness',
    description: 'Resilience',
    zones: [
      { min: 1, max: 33, label: 'Fragile', color: '#FFE4E1' },
      { min: 34, max: 66, label: 'Moderate', color: '#F0E68C' },
      { min: 67, max: 99, label: 'Durable', color: '#98FB98' },
    ],
  },
  inputPipe: {
    label: 'Input Pipe',
    description: 'Learning Style',
    zones: [
      { min: 1, max: 33, label: 'Narrow', color: '#D3D3D3' },
      { min: 34, max: 66, label: 'Moderate', color: '#87CEEB' },
      { min: 67, max: 99, label: 'Wide', color: '#4682B4' },
    ],
  },
  outputPipe: {
    label: 'Output Pipe',
    description: 'Sharing Style',
    zones: [
      { min: 1, max: 33, label: 'Narrow', color: '#D3D3D3' },
      { min: 34, max: 66, label: 'Moderate', color: '#87CEEB' },
      { min: 67, max: 99, label: 'Wide', color: '#4682B4' },
    ],
  },
};

export default function AssessPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'questions' | 'override'>('override');
  const [activeTab, setActiveTab] = useState(0);
  const [scores, setScores] = useState({
    tree: 50,
    bucketLevel: 50,
    bucketThickness: 50,
    inputPipe: 50,
    outputPipe: 50,
  });

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: 'questions' | 'override' | null) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  const handleScoreChange = (measure: keyof typeof scores, value: number) => {
    setScores((prev) => ({ ...prev, [measure]: value }));
  };

  const getZone = (measure: keyof typeof measureConfig, value: number) => {
    const config = measureConfig[measure];
    return config.zones.find((zone) => value >= zone.min && value <= zone.max);
  };

  const handleCalculate = () => {
    localStorage.setItem('tbap_scores', JSON.stringify(scores));
    router.push('/analytics');
  };

  const measureKeys = Object.keys(measureConfig) as Array<keyof typeof measureConfig>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Assessment
        </Typography>
        <ToggleButtonGroup value={mode} exclusive onChange={handleModeChange} size="small">
          <ToggleButton value="questions">
            <QuizOutlined sx={{ mr: 1 }} />
            Questions
          </ToggleButton>
          <ToggleButton value="override">
            <TuneOutlined sx={{ mr: 1 }} />
            Override
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {mode === 'questions' ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Question mode coming soon. For now, please use Override mode to directly set your scores.
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
            {measureKeys.map((key, index) => (
              <Tab key={key} label={measureConfig[key].label} />
            ))}
            <Tab label="Summary" />
          </Tabs>

          {measureKeys.map((measureKey, index) => (
            <TabPanel key={measureKey} value={activeTab} index={index}>
              <Box sx={{ px: 3 }}>
                <Typography variant="h5" sx={{ mb: 1 }}>
                  {measureConfig[measureKey].label}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {measureConfig[measureKey].description}
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Current Value</Typography>
                    <Chip
                      label={`${scores[measureKey]} - ${getZone(measureKey, scores[measureKey])?.label}`}
                      size="small"
                      sx={{
                        bgcolor: getZone(measureKey, scores[measureKey])?.color,
                        color: 'white',
                      }}
                    />
                  </Box>
                  <Slider
                    value={scores[measureKey]}
                    onChange={(_, value) => handleScoreChange(measureKey, value as number)}
                    min={1}
                    max={99}
                    marks={measureKey === 'tree' ? [
                      { value: 1, label: '1' },
                      { value: 6, label: '6' },
                      { value: 12, label: '12' },
                      { value: 25, label: '25' },
                      { value: 37, label: '37' },
                      { value: 50, label: '50' },
                      { value: 62, label: '62' },
                      { value: 75, label: '75' },
                      { value: 87, label: '87' },
                      { value: 99, label: '99' },
                    ] : [
                      { value: 1, label: '1' },
                      { value: 25, label: '25' },
                      { value: 50, label: '50' },
                      { value: 75, label: '75' },
                      { value: 99, label: '99' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Box>

                <Typography variant="h6" sx={{ mb: 2 }}>
                  Zones
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  {measureKey === 'tree' ? (
                    <>
                      <Card
                        sx={{
                          borderLeft: `4px solid #7DA589`,
                          opacity: (scores.tree >= 1 && scores.tree <= 6) || (scores.tree >= 88 && scores.tree <= 99) ? 1 : 0.5,
                        }}
                      >
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Leaf-Root
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Range: 1-6, 88-99
                          </Typography>
                        </CardContent>
                      </Card>
                      <Card
                        sx={{
                          borderLeft: `4px solid #8B4789`,
                          opacity: scores.tree >= 7 && scores.tree <= 12 ? 1 : 0.5,
                        }}
                      >
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Root
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Range: 7-12
                          </Typography>
                        </CardContent>
                      </Card>
                      <Card
                        sx={{
                          borderLeft: `4px solid #8B5768`,
                          opacity: scores.tree >= 13 && scores.tree <= 25 ? 1 : 0.5,
                        }}
                      >
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Root-Trunk
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Range: 13-25
                          </Typography>
                        </CardContent>
                      </Card>
                      <Card
                        sx={{
                          borderLeft: `4px solid #8B6B47`,
                          opacity: scores.tree >= 26 && scores.tree <= 37 ? 1 : 0.5,
                        }}
                      >
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Trunk
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Range: 26-37
                          </Typography>
                        </CardContent>
                      </Card>
                      <Card
                        sx={{
                          borderLeft: `4px solid #6A7550`,
                          opacity: scores.tree >= 38 && scores.tree <= 50 ? 1 : 0.5,
                        }}
                      >
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Trunk-Branch
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Range: 38-50
                          </Typography>
                        </CardContent>
                      </Card>
                      <Card
                        sx={{
                          borderLeft: `4px solid #4A7C59`,
                          opacity: scores.tree >= 51 && scores.tree <= 62 ? 1 : 0.5,
                        }}
                      >
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Branch
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Range: 51-62
                          </Typography>
                        </CardContent>
                      </Card>
                      <Card
                        sx={{
                          borderLeft: `4px solid #6CA074`,
                          opacity: scores.tree >= 63 && scores.tree <= 75 ? 1 : 0.5,
                        }}
                      >
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Branch-Leaf
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Range: 63-75
                          </Typography>
                        </CardContent>
                      </Card>
                      <Card
                        sx={{
                          borderLeft: `4px solid #8FBC8F`,
                          opacity: scores.tree >= 76 && scores.tree <= 87 ? 1 : 0.5,
                        }}
                      >
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Leaf
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Range: 76-87
                          </Typography>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    measureConfig[measureKey].zones.map((zone) => (
                      <Card
                        key={zone.label}
                        sx={{
                          borderLeft: `4px solid ${zone.color}`,
                          opacity: scores[measureKey] >= zone.min && scores[measureKey] <= zone.max ? 1 : 0.5,
                        }}
                      >
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {zone.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Range: {zone.min}-{zone.max}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Box>
              </Box>
            </TabPanel>
          ))}

          {/* Summary Tab */}
          <TabPanel value={activeTab} index={measureKeys.length}>
            <Box sx={{ px: 3 }}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Your Profile Summary
              </Typography>

              {/* Scores Overview */}
              <Box sx={{ mb: 4, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Current Scores</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {measureKeys.map((key) => (
                    <Chip
                      key={key}
                      label={`${measureConfig[key].label}: ${scores[key]} (${getZone(key, scores[key])?.label})`}
                      sx={{
                        bgcolor: getZone(key, scores[key])?.color,
                        color: 'white',
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Text Summary */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                Your Wiring Description
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" paragraph>
                  <strong>Motivation (Tree):</strong>{' '}
                  {(() => {
                    const zone = getZone('tree', scores.tree);
                    const label = zone?.label || 'Root';
                    const cleanLabel = label.includes('Leaf-Root') ? 'Leaf-Root' : label;
                    return measureDescriptions.tree[cleanLabel] || measureDescriptions.tree[label] || 'You are motivated by growth and change.';
                  })()}
                </Typography>

                <Typography variant="body1" paragraph>
                  <strong>Decision Trust (Bucket Level):</strong>{' '}
                  {measureDescriptions.bucketLevel[getZone('bucketLevel', scores.bucketLevel)?.label || 'Balanced']}
                </Typography>

                <Typography variant="body1" paragraph>
                  <strong>Resilience (Bucket Thickness):</strong>{' '}
                  {measureDescriptions.bucketThickness[getZone('bucketThickness', scores.bucketThickness)?.label || 'Moderate']}
                </Typography>

                <Typography variant="body1" paragraph>
                  <strong>Learning Style (Input Pipe):</strong>{' '}
                  {measureDescriptions.inputPipe[getZone('inputPipe', scores.inputPipe)?.label || 'Moderate']}
                </Typography>

                <Typography variant="body1" paragraph>
                  <strong>Sharing Style (Output Pipe):</strong>{' '}
                  {measureDescriptions.outputPipe[getZone('outputPipe', scores.outputPipe)?.label || 'Moderate']}
                </Typography>
              </Box>

              {/* Combined Insight */}
              <Paper sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Integrated Profile
                </Typography>
                <Typography variant="body1">
                  Your unique combination shows someone who{' '}
                  {scores.tree <= 50 ? 'values relationships and systems' : 'seeks impact and innovation'},
                  {' '}with{' '}
                  {scores.bucketLevel <= 50 ? 'data-driven' : 'intuitive'} decision-making that is{' '}
                  {scores.bucketThickness <= 50 ? 'adaptable' : 'steadfast'}.
                  You prefer{' '}
                  {scores.inputPipe <= 50 ? 'quick action' : 'thorough research'} and tend to{' '}
                  {scores.outputPipe <= 50 ? 'process internally' : 'share openly'}.
                </Typography>
              </Paper>
            </Box>
          </TabPanel>
        </Paper>
      )}

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" startIcon={<SaveOutlined />}>
          Save Draft
        </Button>
        <Button variant="contained" startIcon={<CalculateOutlined />} size="large" onClick={handleCalculate}>
          Calculate Results
        </Button>
      </Box>

    </Box>
  );
}