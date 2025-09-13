'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Card, CardContent, Chip, Button, Grid, Switch } from '@mui/material';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ArrowBackOutlined } from '@mui/icons-material';
import Link from 'next/link';
import TreeCompass from '@/components/TreeCompass';
import MeasureGauge from '@/components/MeasureGauge';

interface Scores {
  tree: any;
  bucket: number;
  thickness: number;
  input: number;
  output: number;
  questionValues?: {
    tree: number[];
    bucket: number[];
    thickness: number[];
    input: number[];
    output: number[];
  };
}

export default function AnalyticsPage() {
  const [scores, setScores] = useState<Scores | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [dataSource, setDataSource] = useState<'questions' | 'manual'>('manual');
  const [questionValues, setQuestionValues] = useState<any>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('tbap_scores');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      const finalScores = parsed.scores || parsed;
      setScores(finalScores);
      setDataSource(parsed.source || 'manual');
      setQuestionValues(parsed.questionValues);
      calculateAnalytics(finalScores);
    }
  }, []);

  const calculateAnalytics = (scores: Scores) => {
    const treeScore = typeof scores.tree === 'object' ? scores.tree.score : scores.tree;
    const treeType = getTreeType(treeScore);
    const archetype = getArchetype(treeScore, scores.output);
    const decisionProfile = getDecisionProfile(scores.bucket, scores.thickness);
    const pipeProfile = getPipeProfile(scores.input, scores.output);

    setAnalytics({
      treeType,
      archetype,
      decisionProfile,
      pipeProfile,
    });
  };

  const getTreeType = (score: number) => {
    if (score <= 6) return { type: 'Leaf-Root (A)', color: '#6B5B8C', primary: 'Leaf', secondary: 'Root' };
    if (score <= 12) return { type: 'Root', color: '#8B4789', primary: 'Root', secondary: null };
    if (score <= 25) return { type: 'Root-Trunk', color: '#8B5768', primary: 'Root', secondary: 'Trunk' };
    if (score <= 37) return { type: 'Trunk', color: '#8B6B47', primary: 'Trunk', secondary: null };
    if (score <= 50) return { type: 'Trunk-Branch', color: '#6A7550', primary: 'Trunk', secondary: 'Branch' };
    if (score <= 62) return { type: 'Branch', color: '#4A7C59', primary: 'Branch', secondary: null };
    if (score <= 75) return { type: 'Branch-Leaf', color: '#6CA074', primary: 'Branch', secondary: 'Leaf' };
    if (score <= 87) return { type: 'Leaf', color: '#8FBC8F', primary: 'Leaf', secondary: null };
    return { type: 'Leaf-Root (B)', color: '#7DA589', primary: 'Leaf', secondary: 'Root' };
  };

  const getArchetype = (treeScore: number, outputPipe: number) => {
    const treeData = getTreeType(treeScore);
    const primaryType = treeData.primary;
    const isPeopleOriented = ['Root', 'Leaf'].includes(primaryType);
    const isWideOutput = outputPipe > 50;

    if (isPeopleOriented && !isWideOutput) {
      return {
        name: 'Harmonious Nurturer',
        description: 'Supportive and empathetic, working behind the scenes',
        color: '#E6B8D8',
      };
    }
    if (isPeopleOriented && isWideOutput) {
      return {
        name: 'Inspiring Connector',
        description: 'Charismatic motivator and community builder',
        color: '#FFB6C1',
      };
    }
    if (!isPeopleOriented && !isWideOutput) {
      return {
        name: 'Grounded Analyst',
        description: 'Data-driven and methodical problem solver',
        color: '#B8D8E6',
      };
    }
    return {
      name: 'Impactful Driver',
      description: 'Results-oriented strategic change agent',
      color: '#90EE90',
    };
  };

  const getDecisionProfile = (level: number, thickness: number) => {
    const trust = level <= 33 ? 'External' : level <= 66 ? 'Balanced' : 'Internal';
    const resilience = thickness <= 33 ? 'Fragile' : thickness <= 66 ? 'Moderate' : 'Durable';
    return { trust, resilience };
  };

  const getPipeProfile = (input: number, output: number) => {
    const inputWidth = input <= 33 ? 'Narrow' : input <= 66 ? 'Moderate' : 'Wide';
    const outputWidth = output <= 33 ? 'Narrow' : output <= 66 ? 'Moderate' : 'Wide';
    return { input: inputWidth, output: outputWidth };
  };

  if (!scores || !analytics) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          No Assessment Data Found
        </Typography>
        <Link href="/assess" passHref style={{ textDecoration: 'none' }}>
          <Button variant="contained" size="large">
            Take Assessment
          </Button>
        </Link>
      </Box>
    );
  }

  const treeScore = typeof scores.tree === 'object' ? scores.tree.score : scores.tree;

  const radarData = [
    { measure: 'Tree', value: treeScore, fullMark: 100 },
    { measure: 'Bucket', value: scores.bucket, fullMark: 100 },
    { measure: 'Thickness', value: scores.thickness, fullMark: 100 },
    { measure: 'Input', value: scores.input, fullMark: 100 },
    { measure: 'Output', value: scores.output, fullMark: 100 },
  ];

  const barData = [
    { name: 'Tree', value: treeScore, fill: analytics.treeType.color },
    { name: 'Bucket', value: scores.bucket, fill: '#5B8BA0' },
    { name: 'Thickness', value: scores.thickness, fill: '#7BA098' },
    { name: 'Input', value: scores.input, fill: '#8B6B47' },
    { name: 'Output', value: scores.output, fill: '#A08B47' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Link href="/assess" passHref style={{ textDecoration: 'none' }}>
            <Button startIcon={<ArrowBackOutlined />} sx={{ mr: 2 }}>
              Back to Assessment
            </Button>
          </Link>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Your Analytics
          </Typography>
        </Box>
        {dataSource && (
          <Chip
            label={`Source: ${dataSource === 'questions' ? 'Questions' : 'Manual Input'}`}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Five Measures with Gauges */}
        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
              Five Measures Summary
            </Typography>

            {/* Tree Compass */}
            {typeof scores.tree === 'object' && (
              <Box sx={{ mb: 4 }}>
                <TreeCompass
                  score={scores.tree.score}
                  strength={scores.tree.strength}
                  subtype={scores.tree.subtype}
                />
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="h6">
                    Tree: {scores.tree.score}
                  </Typography>
                  <Chip
                    label={scores.tree.subtypeName || analytics.treeType.type}
                    color="primary"
                    size="small"
                  />
                </Box>
              </Box>
            )}

            {/* Four Gauges */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <MeasureGauge
                  label="Bucket"
                  value={scores.bucket}
                  questionValues={dataSource === 'questions' && questionValues ? questionValues.bucket : []}
                  color="#5B8BA0"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <MeasureGauge
                  label="Thickness"
                  value={scores.thickness}
                  questionValues={dataSource === 'questions' && questionValues ? questionValues.thickness : []}
                  color="#7BA098"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <MeasureGauge
                  label="Input"
                  value={scores.input}
                  questionValues={dataSource === 'questions' && questionValues ? questionValues.input : []}
                  color="#8B6B47"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <MeasureGauge
                  label="Output"
                  value={scores.output}
                  questionValues={dataSource === 'questions' && questionValues ? questionValues.output : []}
                  color="#A08B47"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Primary Archetype Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', borderLeft: `4px solid ${analytics.archetype.color}` }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                {analytics.archetype.name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {analytics.archetype.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`${analytics.treeType.type} Type`} sx={{ bgcolor: analytics.treeType.color, color: 'white' }} />
                <Chip label={`${analytics.pipeProfile.output} Output`} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Decision Profile Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                Decision Profile
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Trust Style
                </Typography>
                <Typography variant="h6">{analytics.decisionProfile.trust}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Resilience
                </Typography>
                <Typography variant="h6">{analytics.decisionProfile.resilience}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Radar Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Profile Overview
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="measure" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Score" dataKey="value" stroke="#4A7C59" fill="#4A7C59" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Bar Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Score Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Detailed Scores */}
        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Detailed Scores
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tree
                  </Typography>
                  <Typography variant="h4">{treeScore}</Typography>
                  <Chip
                    label={analytics.treeType.type}
                    size="small"
                    sx={{ bgcolor: analytics.treeType.color, color: 'white', mt: 1 }}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Bucket
                  </Typography>
                  <Typography variant="h4">{scores.bucket}</Typography>
                  <Chip label={analytics.decisionProfile.trust} size="small" sx={{ mt: 1 }} />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Thickness
                  </Typography>
                  <Typography variant="h4">{scores.thickness}</Typography>
                  <Chip label={analytics.decisionProfile.resilience} size="small" sx={{ mt: 1 }} />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Input
                  </Typography>
                  <Typography variant="h4">{scores.input}</Typography>
                  <Chip label={analytics.pipeProfile.input} size="small" sx={{ mt: 1 }} />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Output
                  </Typography>
                  <Typography variant="h4">{scores.output}</Typography>
                  <Chip label={analytics.pipeProfile.output} size="small" sx={{ mt: 1 }} />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Insights */}
        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Key Insights
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Strengths
                </Typography>
                <Typography variant="body2">
                  Based on your {analytics.archetype.name} archetype and {analytics.treeType.type} position,
                  you excel at {analytics.treeType.primary === 'Root' ? 'building harmony and connection' :
                    analytics.treeType.primary === 'Trunk' ? 'creating reliable systems and processes' :
                    analytics.treeType.primary === 'Branch' ? 'driving measurable impact and results' :
                    'discovering innovative solutions and ideas'}
                  {analytics.treeType.secondary && ` while incorporating ${
                    analytics.treeType.secondary === 'Root' ? 'relationship awareness' :
                    analytics.treeType.secondary === 'Trunk' ? 'systematic thinking' :
                    analytics.treeType.secondary === 'Branch' ? 'outcome focus' :
                    'creative exploration'
                  }`}.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Communication Style
                </Typography>
                <Typography variant="body2">
                  With {analytics.pipeProfile.input} input and {analytics.pipeProfile.output} output preferences,
                  you {analytics.pipeProfile.input === 'Narrow' ? 'make quick decisions' : 
                    analytics.pipeProfile.input === 'Wide' ? 'gather extensive information' : 'balance research with action'} and
                  {' '}{analytics.pipeProfile.output === 'Narrow' ? 'keep your thoughts private' :
                    analytics.pipeProfile.output === 'Wide' ? 'actively share and evangelize' : 'selectively communicate'}.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Growth Areas
                </Typography>
                <Typography variant="body2">
                  Consider developing complementary skills from
                  {' '}{analytics.treeType.primary === 'Root' ? 'Branch (impact focus)' :
                    analytics.treeType.primary === 'Trunk' ? 'Leaf (creative exploration)' :
                    analytics.treeType.primary === 'Branch' ? 'Root (relationship building)' :
                    'Trunk (systematic thinking)'} to expand your effectiveness.
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}