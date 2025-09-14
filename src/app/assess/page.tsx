'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Switch,
} from '@mui/material';
import {
  QuizOutlined,
  TuneOutlined,
  SaveOutlined,
  CalculateOutlined,
  SummarizeOutlined,
  RefreshOutlined,
  ClearOutlined,
  AnalyticsOutlined
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import questions from '@/data/questions.json';
import measuresDataRaw from '@/data/measures.json';
import type { MeasuresComplete } from '@/types/measures';

// Type-safe access to measures with proper type coercion
const measuresData = measuresDataRaw as unknown as MeasuresComplete;
const measures = measuresData.measures;

import {
  processQuestionResponses,
  calculateInteractionArchetype,
  calculateEngagementAxis,
  type AssessmentScores
} from '@/lib/calculations';
import TreeCompass from '@/components/TreeCompass';
import MeasureGauge from '@/components/MeasureGauge';
import EnhancedGauge from '@/components/EnhancedGauge';
import CircularSlider from '@/components/CircularSlider';
import ProfessionalSlider from '@/components/ProfessionalSlider';

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
  const [randomizedQuestions, setRandomizedQuestions] = useState(questions.questions);

  // Load saved data on mount and randomize questions client-side only
  useEffect(() => {
    // Randomize questions on client side only
    setRandomizedQuestions([...questions.questions].sort(() => Math.random() - 0.5));

    const savedManualScores = localStorage.getItem('tbap_manual_scores');
    const savedQuestionResponses = localStorage.getItem('tbap_question_responses');
    const savedScoreSource = localStorage.getItem('tbap_score_source');

    if (savedManualScores) {
      setManualScores(JSON.parse(savedManualScores));
    }

    if (savedQuestionResponses) {
      const parsed = JSON.parse(savedQuestionResponses);
      setQuestionResponses(new Map(parsed));
    }

    if (savedScoreSource) {
      setScoreSource(savedScoreSource as 'questions' | 'manual');
    }
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    localStorage.setItem('tbap_manual_scores', JSON.stringify(manualScores));
  }, [manualScores]);

  useEffect(() => {
    const responsesArray = Array.from(questionResponses.entries());
    localStorage.setItem('tbap_question_responses', JSON.stringify(responsesArray));
  }, [questionResponses]);

  useEffect(() => {
    localStorage.setItem('tbap_score_source', scoreSource);
  }, [scoreSource]);
  
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

  // Animated value change for smooth transitions
  const animateValueChange = (
    measure: keyof typeof manualScores,
    targetValue: number,
    duration: number = 300
  ) => {
    const startValue = manualScores[measure];
    const startTime = Date.now();
    const diff = targetValue - startValue;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeInOutCubic = (t: number) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      const easedProgress = easeInOutCubic(progress);
      const currentValue = Math.round(startValue + diff * easedProgress);

      handleManualScoreChange(measure, currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleCalculateFromQuestions = () => {
    if (calculatedScores) {
      setScoreSource('questions');
      setActiveTab(2); // Go to summary
    }
  };

  const handleSaveResults = () => {
    // Save final scores with source info
    const dataToSave = {
      scores: finalScores,
      source: scoreSource,
      questionValues: scoreSource === 'questions' ? calculatedScores?.questionValues : undefined
    };
    localStorage.setItem('tbap_scores', JSON.stringify(dataToSave));
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
          <Tab icon={<AnalyticsOutlined />} label="Analytics" />
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
                    <Box sx={{ mb: 2 }}>
                      {/* Question type indicator */}
                      <Chip 
                        label={(() => {
                          const q = randomizedQuestions[currentQuestionIndex];
                          if (q.measure === 'tree') {
                            const subtypeLabels = {
                              'root': 'Tree - Harmony & Connection',
                              'trunk': 'Tree - Mastery & Growth',
                              'branch': 'Tree - Impact & Legacy',
                              'leaf': 'Tree - Novelty & Discovery'
                            };
                            return subtypeLabels[q.subtype as keyof typeof subtypeLabels] || 'Tree';
                          }
                          const measureLabels = {
                            'bucket': 'Bucket - Knowledge Capacity',
                            'thickness': 'Thickness - Questioning & Boundaries',
                            'input': 'Input - Learning Style',
                            'output': 'Output - Sharing Style'
                          };
                          return measureLabels[q.measure as keyof typeof measureLabels] || q.measure;
                        })()}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
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
                                / 100
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

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Tree - Circular Dial with new styling */}
              <Box sx={{
                width: '100%',
                p: 3,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                borderRadius: 3,
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              }}>
                {/* Header */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mb: 0.5 }}>
                    {measures.tree.displayName} <span style={{ fontWeight: 'normal', fontSize: '0.9em', color: '#666' }}>({measures.tree.altName})</span>
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {measures.tree.shortDescription}
                  </Typography>
                </Box>

                {/* Main content area with compass and description */}
                <Box sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 2, md: 4 },
                  alignItems: 'center'
                }}>
                  {/* Compass with controls */}
                  <Box sx={{
                    flex: { xs: '1 1 auto', md: '0 0 auto' },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: { xs: '100%', md: 'auto' },
                    position: 'relative'
                  }}>
                    {/* Controls at top - on either side of label */}
                    <Box sx={{
                      position: 'absolute',
                      top: 10,
                      left: 0,
                      right: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      zIndex: 10
                    }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          // Move 11 points back (roughly one subtype)
                          let newValue = manualScores.tree - 11;
                          if (newValue < 1) newValue = 100 + newValue; // Wrap around
                          animateValueChange('tree', newValue, 400); // Slower for bigger jumps
                        }}
                        sx={{
                          minWidth: 40,
                          height: 32,
                          borderRadius: 2,
                          p: 0,
                          fontSize: '14px'
                        }}
                      >
                        --
                      </Button>

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          // Move 1 point back
                          const newValue = manualScores.tree === 1 ? 100 : manualScores.tree - 1;
                          animateValueChange('tree', newValue, 200); // Faster for single steps
                        }}
                        sx={{
                          minWidth: 32,
                          height: 32,
                          borderRadius: 2,
                          p: 0,
                          fontSize: '16px'
                        }}
                      >
                        -
                      </Button>

                      {/* Label in middle - gets rendered by CircularSlider */}
                      <Box sx={{ width: 120, textAlign: 'center' }} />

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          // Move 1 point forward
                          const newValue = manualScores.tree === 100 ? 1 : manualScores.tree + 1;
                          animateValueChange('tree', newValue, 200); // Faster for single steps
                        }}
                        sx={{
                          minWidth: 32,
                          height: 32,
                          borderRadius: 2,
                          p: 0,
                          fontSize: '16px'
                        }}
                      >
                        +
                      </Button>

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          // Move 11 points forward (roughly one subtype)
                          let newValue = manualScores.tree + 11;
                          if (newValue > 100) newValue = newValue - 100; // Wrap around
                          animateValueChange('tree', newValue, 400); // Slower for bigger jumps
                        }}
                        sx={{
                          minWidth: 40,
                          height: 32,
                          borderRadius: 2,
                          p: 0,
                          fontSize: '14px'
                        }}
                      >
                        ++
                      </Button>
                    </Box>

                    <CircularSlider
                      value={manualScores.tree}
                      onChange={(value) => handleManualScoreChange('tree', value)}
                    />
                  </Box>

                  {/* Type description - below on mobile, right side on desktop */}
                  <Box sx={{
                    flex: 1,
                    width: { xs: '100%', md: 'auto' },
                    maxWidth: { xs: '100%', md: '500px' }
                  }}>
                    <Box sx={{
                      p: 2,
                      bgcolor: 'rgba(74, 124, 89, 0.05)',
                      borderRadius: 2,
                      border: '2px solid #4A7C59'
                    }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#4A7C59', mb: 1 }}>
                        {(() => {
                          const treeValue = manualScores.tree;
                          // Match the logic from CircularSlider
                          if (treeValue <= 6.25 || treeValue > 93.75) return 'Root-Leaf';
                          if (treeValue <= 18.75) return 'Root';
                          if (treeValue <= 31.25) return 'Root-Trunk';
                          if (treeValue <= 43.75) return 'Trunk';
                          if (treeValue <= 56.25) return 'Trunk-Branch';
                          if (treeValue <= 68.75) return 'Branch';
                          if (treeValue <= 81.25) return 'Branch-Leaf';
                          if (treeValue <= 93.75) return 'Leaf';
                          return 'Root-Leaf';
                        })()}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#555' }}>
                        {(() => {
                          const treeValue = manualScores.tree;
                          // Get the matching subtype description from the JSON
                          const subtype = measures.tree.subtypes.find(st => {
                            if (st.id === 'root_leaf') {
                              return (treeValue >= st.range[0] && treeValue <= st.range[1]) ||
                                     (st.altRange && treeValue >= st.altRange[0] && treeValue <= st.altRange[1]);
                            }
                            return treeValue >= st.range[0] && treeValue <= st.range[1];
                          });
                          return subtype?.description || '';
                        })()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Bucket */}
              <ProfessionalSlider
                measureData={measures.bucket}
                value={manualScores.bucket}
                onChange={(value) => handleManualScoreChange('bucket', value)}
                min={1}
                max={100}
                color="#5B8BA0"
              />

              {/* Thickness */}
              <ProfessionalSlider
                measureData={measures.thickness}
                value={manualScores.thickness}
                onChange={(value) => handleManualScoreChange('thickness', value)}
                min={1}
                max={100}
                color="#7BA098"
              />

              {/* Input */}
              <ProfessionalSlider
                measureData={measures.input}
                value={manualScores.input}
                onChange={(value) => handleManualScoreChange('input', value)}
                min={1}
                max={100}
                color="#8B6B47"
              />

              {/* Output */}
              <ProfessionalSlider
                measureData={measures.output}
                value={manualScores.output}
                onChange={(value) => handleManualScoreChange('output', value)}
                min={1}
                max={100}
                color="#A08B47"
              />
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
          <Box sx={{ px: 3, maxWidth: 1200, mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">
                Your TBAP Profile
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Use {scoreSource === 'manual' ? 'Manual' : 'Questions'} Data
                </Typography>
                <Switch
                  checked={scoreSource === 'questions'}
                  onChange={(e) => {
                    if (e.target.checked && calculatedScores) {
                      setScoreSource('questions');
                    } else if (!e.target.checked) {
                      setScoreSource('manual');
                    }
                  }}
                  disabled={!calculatedScores}
                />
              </Box>
            </Box>

            {/* Motivation Compass Section */}
            {typeof finalScores.tree === 'object' && (
              <Box sx={{
                width: '100%',
                p: 3,
                mb: 4,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                borderRadius: 3,
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mb: 3, textAlign: 'center' }}>
                  Motivation Compass
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'center' }}>
                  <Box>
                    <CircularSlider
                      value={typeof finalScores.tree === 'object' ? finalScores.tree.score : finalScores.tree}
                      onChange={() => {}} // No-op for display only
                      disabled={true}
                    />
                  </Box>
                  <Box sx={{
                    p: 2,
                    bgcolor: 'rgba(74, 124, 89, 0.05)',
                    borderRadius: 2,
                    border: '2px solid #4A7C59',
                    minWidth: 300
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#4A7C59', mb: 1 }}>
                      {finalScores.tree.subtypeName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#555' }}>
                      Score: {finalScores.tree.score} | Strength: {finalScores.tree.strength}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Four Beautiful Gauges with Bands */}
            <Grid container spacing={3}>
              {/* Knowledge Bucket */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  borderRadius: 3,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}>
                  <EnhancedGauge
                    title="Knowledge Bucket"
                    value={finalScores.bucket}
                    measureData={measures.bucket}
                    color="#5B8BA0"
                    questionValues={scoreSource === 'questions' ? calculatedScores?.questionValues?.bucket : []}
                  />
                </Box>
              </Grid>

              {/* Resilience */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  borderRadius: 3,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}>
                  <EnhancedGauge
                    title="Resilience"
                    value={finalScores.thickness}
                    measureData={measures.thickness}
                    color="#7BA098"
                    questionValues={scoreSource === 'questions' ? calculatedScores?.questionValues?.thickness : []}
                  />
                </Box>
              </Grid>

              {/* Gathering */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  borderRadius: 3,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}>
                  <EnhancedGauge
                    title="Gathering"
                    value={finalScores.input}
                    measureData={measures.input}
                    color="#8B6B47"
                    questionValues={scoreSource === 'questions' ? calculatedScores?.questionValues?.input : []}
                  />
                </Box>
              </Grid>

              {/* Sharing */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  borderRadius: 3,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}>
                  <EnhancedGauge
                    title="Sharing"
                    value={finalScores.output}
                    measureData={measures.output}
                    color="#A08B47"
                    questionValues={scoreSource === 'questions' ? calculatedScores?.questionValues?.output : []}
                  />
                </Box>
              </Grid>
            </Grid>

            {/* Your TBAP Profile Summary */}
            <Box sx={{
              mt: 4,
              p: 3,
              background: 'linear-gradient(135deg, #f9f9f9 0%, #e9e9e9 100%)',
              borderRadius: 3,
              boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mb: 2 }}>
                Your TBAP Profile
              </Typography>
            </Box>



            {/* Interaction Archetype - Hidden for now */}
            {false && (
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
            )}


          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Your Complete TBAP Analysis
            </Typography>

            {/* Concatenated fullDescription paragraph */}
            {finalScores && (
              <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                  {(() => {
                    // Find the active band for Tree
                    const treeValue = typeof finalScores.tree === 'object' ? finalScores.tree.score : finalScores.tree;
                    const treeBand = measures.tree.subtypes.find(st => {
                      if (st.altRange && treeValue >= st.altRange[0]) return true;
                      return treeValue >= st.range[0] && treeValue <= st.range[1];
                    });

                    // Calculate engagement score from tree value
                    const engagementScore = calculateEngagementAxis(treeValue).score;

                    // Get engagement bands from analytics section
                    const engagementBands = (measuresData as any).analytics?.engagement?.bands || [];
                    const engagementBand = engagementBands.find((b: any) =>
                      engagementScore >= b.range[0] && engagementScore <= b.range[1]
                    );

                    // Find active bands for other measures
                    const bucketBand = measures.bucket.bands.find(b =>
                      finalScores.bucket >= b.range[0] && finalScores.bucket <= b.range[1]
                    );
                    const thicknessBand = measures.thickness.bands.find(b =>
                      finalScores.thickness >= b.range[0] && finalScores.thickness <= b.range[1]
                    );
                    const inputBand = measures.input.bands.find(b =>
                      finalScores.input >= b.range[0] && finalScores.input <= b.range[1]
                    );
                    const outputBand = measures.output.bands.find(b =>
                      finalScores.output >= b.range[0] && finalScores.output <= b.range[1]
                    );

                    // Concatenate all fullDesc texts including engagement
                    return [
                      treeBand?.description || '',
                      engagementBand?.fullDescription || '',
                      bucketBand?.fullDesc || '',
                      thicknessBand?.fullDesc || '',
                      inputBand?.fullDesc || '',
                      outputBand?.fullDesc || ''
                    ].filter(desc => desc).join(' ');
                  })()}
                </Typography>
              </Box>
            )}

            {/* Save Results Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSaveResults}
                startIcon={<SaveOutlined />}
              >
                Save Results
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}