'use client';

import React from 'react';
import { Box, Typography, LinearProgress, Chip } from '@mui/material';
import { Groups, Person, TrendingUp } from '@mui/icons-material';

interface EngagementAxisProps {
  score: number;      // 1-99 engagement score
  label: string;      // e.g., "Highly Relational"
  description: string;
  animated?: boolean;
}

export default function EngagementAxis({ score, label, description, animated = true }: EngagementAxisProps) {
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Engagement Axis
      </Typography>
      
      {/* Score and Label */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Groups sx={{ color: 'text.secondary', fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            With Others
          </Typography>
        </Box>
        
        <Chip 
          label={`${score} - ${label}`}
          color="primary"
          size="small"
        />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Toward Goal
          </Typography>
          <TrendingUp sx={{ color: 'text.secondary', fontSize: 20 }} />
        </Box>
      </Box>
      
      {/* Visual Bar */}
      <Box sx={{ position: 'relative' }}>
        {/* Background gradient */}
        <Box
          sx={{
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(90deg, #4caf50 0%, #2196f3 50%, #ff9800 100%)',
            opacity: 0.2,
            mb: 1
          }}
        />
        
        {/* Score indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: `${score}%`,
            transform: 'translateX(-50%)',
            transition: animated ? 'all 0.5s ease' : 'none',
          }}
        >
          <Box
            sx={{
              width: 4,
              height: 40,
              bgcolor: 'primary.main',
              borderRadius: 1,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              top: 45,
              left: '50%',
              transform: 'translateX(-50%)',
              fontWeight: 'bold',
              color: 'primary.main'
            }}
          >
            {score}
          </Typography>
        </Box>
        
        {/* Center marker for "Solo Focus" */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <Box
            sx={{
              width: 1,
              height: 40,
              bgcolor: 'grey.400',
              opacity: 0.5,
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <Person sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: 45,
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'text.secondary',
                whiteSpace: 'nowrap'
              }}
            >
              Solo Focus
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Description */}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
        {description}
      </Typography>
      
      {/* Visual explanation of the curve */}
      <Box sx={{ 
        mt: 2, 
        p: 2, 
        bgcolor: 'grey.50', 
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'grey.200'
      }}>
        <Typography variant="caption" color="text.secondary">
          <strong>How it works:</strong> Your engagement style emerges from your Tree type. 
          Root and Leaf types (edges) lean toward group engagement, while Trunk and Branch types (center) 
          prefer solo focus. Your score of {score} indicates you are {label.toLowerCase()}.
        </Typography>
      </Box>
    </Box>
  );
}