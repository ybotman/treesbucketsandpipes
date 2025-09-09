'use client';

import { Box, Typography, Button, Card, CardContent, Grid } from '@mui/material';
import { ParkOutlined, WaterDropOutlined, PlumbingOutlined, AnalyticsOutlined } from '@mui/icons-material';
import Link from 'next/link';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

export default function HomePage() {
  const models = [
    {
      icon: <ParkOutlined sx={{ fontSize: 48 }} />,
      title: 'Tree Model',
      subtitle: 'Motivation',
      description: 'Discover what drives you: belonging (Root), mastery (Trunk), impact (Branch), or novelty (Leaf).',
      color: '#4A7C59',
    },
    {
      icon: <WaterDropOutlined sx={{ fontSize: 48 }} />,
      title: 'Bucket Model',
      subtitle: 'Decision Making',
      description: 'Understand how you trust your gut and how resilient that trust is under pressure.',
      color: '#5B8BA0',
    },
    {
      icon: <PlumbingOutlined sx={{ fontSize: 48 }} />,
      title: 'Pipes Model',
      subtitle: 'Engagement',
      description: 'Learn how you gather information (Input) and share decisions (Output).',
      color: '#8B6B47',
    },
    {
      icon: <AnalyticsOutlined sx={{ fontSize: 48 }} />,
      title: 'Archetypes',
      subtitle: 'Combined Insights',
      description: 'Map your complete profile to one of four interaction archetypes.',
      color: '#8B4789',
    },
  ];

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
          Trees, Buckets, and Pipes
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Understand Your Wiring. Transform Your Interactions.
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
          Every person is good. Differences in motivation, decision-making, and communication are wiring, not flaws.
          Discover your unique wiring through our comprehensive assessment based on the TBAP framework.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Link href="/assess" passHref style={{ textDecoration: 'none' }}>
            <Button variant="contained" size="large" sx={{ px: 4 }}>
              Start Assessment
            </Button>
          </Link>
          <Link href="/explain" passHref style={{ textDecoration: 'none' }}>
            <Button variant="outlined" size="large" sx={{ px: 4 }}>
              Learn More
            </Button>
          </Link>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {models.map((model, index) => (
          <Grid size={{ xs: 12, md: 6 }} key={model.title}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: model.color, mr: 2 }}>
                    {model.icon}
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {model.title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {model.subtitle}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2">
                  {model.description}
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6, p: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          How It Works
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>1. Take the Assessment</Typography>
            <Typography variant="body2" color="text.secondary">
              Answer questions or use manual override to set your scores across 5 key measures.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>2. Get Your Profile</Typography>
            <Typography variant="body2" color="text.secondary">
              Receive detailed analytics showing your Tree type, Bucket profile, and Pipe preferences.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>3. Apply Your Insights</Typography>
            <Typography variant="body2" color="text.secondary">
              Use your archetype to improve relationships, team dynamics, and personal growth.
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}