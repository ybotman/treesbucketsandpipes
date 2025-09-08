'use client';

import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Paper, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function ExplainPage() {
  const measures = [
    {
      title: 'Tree Model - Motivation for Change',
      description: 'What drives you to act and change',
      zones: [
        { range: '1-24', type: 'Root', traits: 'Belonging, harmony, connection, stability' },
        { range: '25-49', type: 'Trunk', traits: 'Mastery, growth, reliability, responsibility' },
        { range: '50-74', type: 'Branch', traits: 'Impact, outcomes, legacy, direction' },
        { range: '75-99', type: 'Leaf', traits: 'Novelty, discovery, creativity, exploration' },
      ],
    },
    {
      title: 'Bucket Level - Trust in Gut',
      description: 'How much you rely on intuition vs external validation',
      zones: [
        { range: '1-33', type: 'External', traits: 'Seeks data and validation from others' },
        { range: '34-66', type: 'Balanced', traits: 'Blends intuition with external input' },
        { range: '67-99', type: 'Internal', traits: 'Strong trust in gut feelings' },
      ],
    },
    {
      title: 'Bucket Thickness - Resilience',
      description: 'How durable your decision confidence is under pressure',
      zones: [
        { range: '1-33', type: 'Fragile', traits: 'Easily influenced by challenges' },
        { range: '34-66', type: 'Moderate', traits: 'Some flexibility under pressure' },
        { range: '67-99', type: 'Durable', traits: 'Maintains confidence despite pushback' },
      ],
    },
    {
      title: 'Input Pipe - Learning Style',
      description: 'How much information you need before deciding',
      zones: [
        { range: '1-33', type: 'Narrow', traits: 'Acts quickly with minimal information' },
        { range: '34-66', type: 'Moderate', traits: 'Gathers reasonable amount of data' },
        { range: '67-99', type: 'Wide', traits: 'Extensive research before decisions' },
      ],
    },
    {
      title: 'Output Pipe - Sharing Style',
      description: 'How strongly you feel the need to share decisions',
      zones: [
        { range: '1-33', type: 'Narrow', traits: 'Reserved, quiet, internal processing' },
        { range: '34-66', type: 'Moderate', traits: 'Selective sharing when appropriate' },
        { range: '67-99', type: 'Wide', traits: 'Expressive, teaching, evangelizing' },
      ],
    },
  ];

  const archetypes = [
    {
      name: 'Harmonious Nurturer',
      formula: 'People-focused (Root/Leaf) + Narrow Output',
      traits: ['Supportive', 'Empathetic', 'Behind-the-scenes', 'Relationship builder'],
      color: '#E6B8D8',
    },
    {
      name: 'Inspiring Connector',
      formula: 'People-focused (Root/Leaf) + Wide Output',
      traits: ['Charismatic', 'Motivating', 'Storyteller', 'Community builder'],
      color: '#FFB6C1',
    },
    {
      name: 'Grounded Analyst',
      formula: 'Fact-focused (Trunk/Branch) + Narrow Output',
      traits: ['Data-driven', 'Methodical', 'Detail-oriented', 'Quality focused'],
      color: '#B8D8E6',
    },
    {
      name: 'Impactful Driver',
      formula: 'Fact-focused (Trunk/Branch) + Wide Output',
      traits: ['Results-oriented', 'Persuasive', 'Strategic', 'Change agent'],
      color: '#90EE90',
    },
  ];

  return (
    <Box>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold' }}>
        Understanding the TBAP Framework
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Core Principle
        </Typography>
        <Typography variant="body1" paragraph>
          Every person is good. Differences in motivation, decision-making, and communication are wiring, not flaws.
          Conflict and stress reveal wiring. Awareness transforms misunderstanding into connection.
        </Typography>
      </Paper>

      <Typography variant="h4" sx={{ mb: 3 }}>
        The 5 Measures
      </Typography>

      {measures.map((measure, index) => (
        <Accordion key={index} defaultExpanded={index === 0}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box>
              <Typography variant="h6">{measure.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {measure.description}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {measure.zones.map((zone) => (
                <Box key={zone.type} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip label={zone.range} size="small" variant="outlined" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', minWidth: 100 }}>
                    {zone.type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {zone.traits}
                  </Typography>
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      <Typography variant="h4" sx={{ mt: 4, mb: 3 }}>
        Interaction Archetypes
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Your Tree type (people vs fact orientation) combined with your Output Pipe (sharing style) creates your Interaction Archetype:
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {archetypes.map((archetype) => (
          <Paper
            key={archetype.name}
            sx={{
              p: 3,
              borderLeft: `4px solid ${archetype.color}`,
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              {archetype.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {archetype.formula}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {archetype.traits.map((trait) => (
                <Chip key={trait} label={trait} size="small" />
              ))}
            </Box>
          </Paper>
        ))}
      </Box>

      <Paper sx={{ p: 3, mt: 4, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          How Assessment Works
        </Typography>
        <Typography variant="body1" paragraph>
          You can complete the assessment in two ways:
        </Typography>
        <Typography variant="body1" component="div">
          <ol style={{ paddingLeft: 20 }}>
            <li>
              <strong>Question Mode:</strong> Answer sets of questions for each measure. Your responses are constrained
              to ensure balanced scoring (questions sum to a fixed total).
            </li>
            <li style={{ marginTop: 8 }}>
              <strong>Override Mode:</strong> Directly set your position on each measure using sliders (1-99 scale).
              No constraints - set each independently based on self-knowledge.
            </li>
          </ol>
        </Typography>
      </Paper>
    </Box>
  );
}