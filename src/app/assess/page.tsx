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

const measureConfig = {
  tree: {
    label: 'Tree',
    description: 'Motivation for Change',
    zones: [
      { min: 1, max: 24, label: 'Root', color: '#8B4789' },
      { min: 25, max: 49, label: 'Trunk', color: '#8B6B47' },
      { min: 50, max: 74, label: 'Branch', color: '#4A7C59' },
      { min: 75, max: 99, label: 'Leaf', color: '#8FBC8F' },
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
                    marks={[
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
                  {measureConfig[measureKey].zones.map((zone) => (
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
                  ))}
                </Box>
              </Box>
            </TabPanel>
          ))}
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

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Current Profile Summary
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' }, gap: 2 }}>
          {measureKeys.map((key) => (
            <Box key={key}>
              <Typography variant="body2" color="text.secondary">
                {measureConfig[key].label}
              </Typography>
              <Typography variant="h6">{scores[key]}</Typography>
              <Chip
                label={getZone(key, scores[key])?.label}
                size="small"
                sx={{
                  bgcolor: getZone(key, scores[key])?.color,
                  color: 'white',
                  mt: 1,
                }}
              />
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}