'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Button,
  Typography,
  Slider,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Grid,
  Alert,
} from '@mui/material';
import { 
  QuizOutlined, 
  TuneOutlined, 
  SaveOutlined, 
  CalculateOutlined,
  SummarizeOutlined,
  RefreshOutlined,
  ClearOutlined
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import questions from '@/data/questions.json';
import descriptions from '@/data/descriptions.json';
import { 
  processQuestionResponses, 
  calculateInteractionArchetype,
  getMeasureDescription,
  getStrengthDescription,
  type AssessmentScores 
} from '@/lib/calculations';
import TreeCompass from '@/components/TreeCompass';

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

export default function AssessPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [questionResponses, setQuestionResponses] = useState<Map<string, number>>(new Map());
  const [manualScores, setManualScores] = useState({
    tree: 50,
    bucket: 50,
    thickness: 50,
    input: 50,
    output: 50,
  });
  const [scoreSource, setScoreSource] = useState<'questions' | 'manual'>('manual');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [tempQuestionValue, setTempQuestionValue] = useState<number | null>(null);

  // Randomize questions once on mount
  const randomizedQuestions = useMemo(() => {
    return [...questions.questions].sort(() => Math.random() - 0.5);
  }, []);
  
  // Initialize temp value when first loading or changing questions
  useEffect(() => {
    if (randomizedQuestions.length > 0) {
      setTempQuestionValue(
        questionResponses.get(randomizedQuestions[currentQuestionIndex].id) || null
      );
    }
  }, [currentQuestionIndex, randomizedQuestions]);

  // Calculate scores from questions
  const calculatedScores = useMemo((): AssessmentScores | null => {
    if (questionResponses.size < randomizedQuestions.length) {
      return null;
    }
    return processQuestionResponses(questionResponses, randomizedQuestions);
  }, [questionResponses, randomizedQuestions]);

  // Get final scores based on source
  const finalScores = useMemo(() => {
    if (scoreSource === 'questions' && calculatedScores) {
      return {
        tree: calculatedScores.tree,
        bucket: calculatedScores.bucket,
        thickness: calculatedScores.thickness,
        input: calculatedScores.input,
        output: calculatedScores.output,
      };
    }
    return {
      tree: { score: manualScores.tree, strength: 50, subtype: 'root', subtypeName: 'Root' },
      bucket: manualScores.bucket,
      thickness: manualScores.thickness,
      input: manualScores.input,
      output: manualScores.output,
    };
  }, [scoreSource, calculatedScores, manualScores]);

  // Calculate interaction archetype
  const interactionArchetype = useMemo(() => {
    const treeScore = typeof finalScores.tree === 'object' 
      ? finalScores.tree.score 
      : finalScores.tree;
    return calculateInteractionArchetype(treeScore, finalScores.output);
  }, [finalScores]);

  const handleQuestionResponse = (questionId: string, value: number) => {
    const newResponses = new Map(questionResponses);
    newResponses.set(questionId, value);
    setQuestionResponses(newResponses);
  };

  const handleManualScoreChange = (measure: keyof typeof manualScores, value: number) => {
    setManualScores((prev) => ({ ...prev, [measure]: value }));
    setScoreSource('manual');
  };

  const handleCalculateFromQuestions = () => {
    if (calculatedScores) {
      setScoreSource('questions');
      setActiveTab(2); // Go to summary
    }
  };

  const handleSaveResults = () => {
    localStorage.setItem('tbap_scores', JSON.stringify(finalScores));
    localStorage.setItem('tbap_archetype', JSON.stringify(interactionArchetype));
    router.push('/analytics');
  };

  const resetQuestions = () => {
    setQuestionResponses(new Map());
    setCurrentQuestionIndex(0);
  };

  const progress = (questionResponses.size / randomizedQuestions.length) * 100;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          TBAP Assessment
        </Typography>
        {scoreSource === 'questions' && calculatedScores && (
          <Chip 
            label="Scores from Questions" 
            color="primary" 
            variant="outlined"
          />
        )}
      </Box>

      <Paper>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab icon={<QuizOutlined />} label="Questions" />
          <Tab icon={<TuneOutlined />} label="Manual" />
          <Tab icon={<SummarizeOutlined />} label="Summary" />
        </Tabs>

        {/* Questions Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ px: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Answer All Questions</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Question {Math.min(currentQuestionIndex + 1, randomizedQuestions.length)} of {randomizedQuestions.length}
                  </Typography>
                  <Chip 
                    label={`${questionResponses.size} answered`} 
                    color={questionResponses.size === randomizedQuestions.length ? "success" : "default"}
                    size="small"
                  />
                </Box>
              </Box>
              <LinearProgress variant="determinate" value={progress} />
            </Box>

            {progress === 100 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="success.main" sx={{ mb: 2 }}>
                  All questions completed!
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleCalculateFromQuestions}
                    startIcon={<CalculateOutlined />}
                  >
                    Calculate Results
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={resetQuestions}
                    startIcon={<RefreshOutlined />}
                  >
                    Reset Questions
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontSize: '1.2rem', fontWeight: 500 }}>
                        {randomizedQuestions[currentQuestionIndex].text}
                      </Typography>
                    </Box>
                    
                    {/* Current Score Display */}
                    <Box sx={{ mt: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Your Response
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {tempQuestionValue !== null ? (
                            <>
                              <Typography variant="h5" color="primary" fontWeight="bold">
                                {tempQuestionValue}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                / 99
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="h5" color="text.secondary">
                              Not Set
                            </Typography>
                          )}
                          {questionResponses.has(randomizedQuestions[currentQuestionIndex].id) && (
                            <Chip 
                              label={`Saved: ${questionResponses.get(randomizedQuestions[currentQuestionIndex].id)}`} 
                              size="small" 
                              color="success"
                              sx={{ ml: 2 }}
                            />
                          )}
                        </Box>
                      </Box>
                      
                      <Slider
                        value={tempQuestionValue || 50}
                        onChange={(_, value) => setTempQuestionValue(value as number)}
                        min={questions.scale.min}
                        max={questions.scale.max}
                        marks={questions.scale.markers}
                        valueLabelDisplay="auto"
                        sx={{ 
                          mb: 4,
                          '& .MuiSlider-thumb': {
                            display: tempQuestionValue === null ? 'none' : 'block'
                          }
                        }}
                      />
                      
                      {/* Quick select buttons */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        {questions.scale.markers.map((marker: any) => (
                          <Button
                            key={marker.value}
                            variant={tempQuestionValue === marker.value ? "contained" : "outlined"}
                            size="small"
                            onClick={() => setTempQuestionValue(marker.value)}
                            sx={{ minWidth: 'auto', px: 1 }}
                          >
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" display="block">
                                {marker.value}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                {marker.label}
                              </Typography>
                            </Box>
                          </Button>
                        ))}
                      </Box>
                      
                      {/* Submit and Reset buttons */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                        <Button
                          variant="outlined"
                          startIcon={<ClearOutlined />}
                          onClick={() => {
                            setTempQuestionValue(null);
                            // Also remove from saved responses if exists
                            if (questionResponses.has(randomizedQuestions[currentQuestionIndex].id)) {
                              const newResponses = new Map(questionResponses);
                              newResponses.delete(randomizedQuestions[currentQuestionIndex].id);
                              setQuestionResponses(newResponses);
                            }
                          }}
                          disabled={tempQuestionValue === null && !questionResponses.has(randomizedQuestions[currentQuestionIndex].id)}
                        >
                          Reset
                        </Button>
                        <Button
                          variant="contained"
                          size="large"
                          onClick={() => {
                            if (tempQuestionValue !== null) {
                              handleQuestionResponse(
                                randomizedQuestions[currentQuestionIndex].id,
                                tempQuestionValue
                              );
                              if (currentQuestionIndex < randomizedQuestions.length - 1) {
                                setCurrentQuestionIndex(currentQuestionIndex + 1);
                                setTempQuestionValue(
                                  questionResponses.get(randomizedQuestions[currentQuestionIndex + 1].id) || 
                                  null
                                );
                              }
                            }
                          }}
                          sx={{ minWidth: 200 }}
                          disabled={tempQuestionValue === null}
                        >
                          Submit Answer
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Navigation and Status */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => {
                      const newIndex = currentQuestionIndex - 1;
                      setCurrentQuestionIndex(newIndex);
                      setTempQuestionValue(
                        questionResponses.get(randomizedQuestions[newIndex].id) || null
                      );
                    }}
                  >
                    Previous
                  </Button>
                  
                  {/* Question dots indicator */}
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {[...Array(Math.min(10, randomizedQuestions.length))].map((_, i) => {
                      const qIndex = i + Math.max(0, currentQuestionIndex - 4);
                      if (qIndex >= randomizedQuestions.length) return null;
                      return (
                        <Box
                          key={qIndex}
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: questionResponses.has(randomizedQuestions[qIndex].id) 
                              ? 'success.main' 
                              : qIndex === currentQuestionIndex 
                              ? 'primary.main'
                              : 'grey.300',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setCurrentQuestionIndex(qIndex);
                            setTempQuestionValue(
                              questionResponses.get(randomizedQuestions[qIndex].id) || null
                            );
                          }}
                        />
                      );
                    })}
                  </Box>
                  
                  <Button
                    disabled={currentQuestionIndex >= randomizedQuestions.length - 1}
                    onClick={() => {
                      if (currentQuestionIndex < randomizedQuestions.length - 1) {
                        const newIndex = currentQuestionIndex + 1;
                        setCurrentQuestionIndex(newIndex);
                        setTempQuestionValue(
                          questionResponses.get(randomizedQuestions[newIndex].id) || null
                        );
                      }
                    }}
                  >
                    Skip
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Manual Override Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ px: 3, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Manual Score Override
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Directly set your scores on each measure (1-99 scale)
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Tree */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Tree (Motivation for Change)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  What drives you to act and change
                </Typography>
                <Slider
                  value={manualScores.tree}
                  onChange={(_, value) => handleManualScoreChange('tree', value as number)}
                  min={1}
                  max={99}
                  marks={[
                    { value: 1, label: 'Root' },
                    { value: 25, label: 'Trunk' },
                    { value: 50, label: 'Branch' },
                    { value: 75, label: 'Leaf' },
                    { value: 99, label: '' }
                  ]}
                  valueLabelDisplay="on"
                />
              </Box>

              {/* Bucket */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Bucket (Knowledge Capacity)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  How much you can hold and juggle at once
                </Typography>
                <Slider
                  value={manualScores.bucket}
                  onChange={(_, value) => handleManualScoreChange('bucket', value as number)}
                  min={1}
                  max={99}
                  marks={[
                    { value: 1, label: 'Focused' },
                    { value: 50, label: 'Balanced' },
                    { value: 99, label: 'Multiple' }
                  ]}
                  valueLabelDisplay="on"
                />
              </Box>

              {/* Thickness */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Thickness (Questioning & Boundaries)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  How much you question and protect your boundaries
                </Typography>
                <Slider
                  value={manualScores.thickness}
                  onChange={(_, value) => handleManualScoreChange('thickness', value as number)}
                  min={1}
                  max={99}
                  marks={[
                    { value: 1, label: 'Permeable' },
                    { value: 50, label: 'Flexible' },
                    { value: 99, label: 'Strong' }
                  ]}
                  valueLabelDisplay="on"
                />
              </Box>

              {/* Input */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Input (Learning Style)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  How you gather and process information
                </Typography>
                <Slider
                  value={manualScores.input}
                  onChange={(_, value) => handleManualScoreChange('input', value as number)}
                  min={1}
                  max={99}
                  marks={[
                    { value: 1, label: 'Selective' },
                    { value: 50, label: 'Moderate' },
                    { value: 99, label: 'Wide' }
                  ]}
                  valueLabelDisplay="on"
                />
              </Box>

              {/* Output */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Output (Sharing Style)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  How you express and share what you know
                </Typography>
                <Slider
                  value={manualScores.output}
                  onChange={(_, value) => handleManualScoreChange('output', value as number)}
                  min={1}
                  max={99}
                  marks={[
                    { value: 1, label: 'Internal' },
                    { value: 50, label: 'Balanced' },
                    { value: 99, label: 'External' }
                  ]}
                  valueLabelDisplay="on"
                />
              </Box>
            </Box>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  setScoreSource('manual');
                  setActiveTab(2);
                }}
              >
                View Summary
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Summary Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Your TBAP Profile
            </Typography>

            {/* Tree Compass Visualization */}
            {typeof finalScores.tree === 'object' && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Tree Position
                </Typography>
                <TreeCompass
                  score={finalScores.tree.score}
                  strength={finalScores.tree.strength}
                  subtype={finalScores.tree.subtype}
                />
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Chip
                    label={`${finalScores.tree.subtypeName} (Position: ${finalScores.tree.score})`}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={getStrengthDescription(finalScores.tree.strength).label}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                  {getStrengthDescription(finalScores.tree.strength).description}
                </Typography>
              </Box>
            )}

            {/* All Scores */}
            <Box sx={{ mb: 4, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Five Measures</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Tree</Typography>
                  <Typography variant="h6">
                    {typeof finalScores.tree === 'object' ? finalScores.tree.score : finalScores.tree}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="body2" color="text.secondary">Bucket</Typography>
                  <Typography variant="h6">{finalScores.bucket}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="body2" color="text.secondary">Thickness</Typography>
                  <Typography variant="h6">{finalScores.thickness}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="body2" color="text.secondary">Input</Typography>
                  <Typography variant="h6">{finalScores.input}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="body2" color="text.secondary">Output</Typography>
                  <Typography variant="h6">{finalScores.output}</Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Interaction Archetype */}
            <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Interaction Archetype: {interactionArchetype.archetypeName}
              </Typography>
              <Typography variant="body1">
                {interactionArchetype.description}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Chip
                  label={`${interactionArchetype.orientation} oriented`}
                  sx={{ bgcolor: 'white', color: 'primary.main' }}
                />
                <Chip
                  label={`${interactionArchetype.expression} expression`}
                  sx={{ bgcolor: 'white', color: 'primary.main' }}
                />
              </Box>
            </Paper>

            {/* Descriptions */}
            <Box sx={{ mb: 3 }}>
              {typeof finalScores.tree === 'object' && (
                <Typography variant="body1" paragraph>
                  <strong>Tree:</strong> {
                    descriptions.treeSubtypes[
                      finalScores.tree.subtype as keyof typeof descriptions.treeSubtypes
                    ]?.description
                  }
                </Typography>
              )}
              <Typography variant="body1" paragraph>
                <strong>Bucket:</strong> {getMeasureDescription('bucket', finalScores.bucket)}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Thickness:</strong> {getMeasureDescription('thickness', finalScores.thickness)}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Input:</strong> {getMeasureDescription('input', finalScores.input)}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Output:</strong> {getMeasureDescription('output', finalScores.output)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSaveResults}
                startIcon={<SaveOutlined />}
              >
                Save & View Analytics
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}