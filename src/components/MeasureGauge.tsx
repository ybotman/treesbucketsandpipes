'use client';

import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';

interface MeasureGaugeProps {
  label: string;
  value: number;
  questionValues?: number[];
  min?: number;
  max?: number;
  color?: string;
}

export default function MeasureGauge({
  label,
  value,
  questionValues = [],
  min = 1,
  max = 100,
  color = '#4A7C59'
}: MeasureGaugeProps) {
  // Handle null/undefined values by defaulting to 0
  const safeValue = value ?? min;
  const normalizedValue = ((safeValue - min) / (max - min)) * 180;

  const normalizedQuestionValues = useMemo(() => {
    return questionValues.map(v => ((v - min) / (max - min)) * 180);
  }, [questionValues, min, max]);

  const variance = useMemo(() => {
    if (questionValues.length === 0) return 0;
    const avg = questionValues.reduce((a, b) => a + b, 0) / questionValues.length;
    const squaredDiffs = questionValues.map(v => Math.pow(v - avg, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / questionValues.length);
  }, [questionValues]);

  const dotSize = variance > 20 ? 8 : variance > 10 ? 12 : 16;

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      p: 2
    }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        {label}
      </Typography>

      <Box sx={{ position: 'relative', width: 200, height: 120 }}>
        <svg width="200" height="120" viewBox="0 0 200 100">
          {/* Gauge background arc */}
          <path
            d={`M 10 90 A 80 80 0 0 1 190 90`}
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Gauge filled arc */}
          <path
            d={`M 10 90 A 80 80 0 ${normalizedValue > 90 ? 1 : 0} 1 ${
              10 + 180 * Math.cos((Math.PI * (180 - normalizedValue)) / 180)
            } ${
              90 - 80 * Math.sin((Math.PI * (180 - normalizedValue)) / 180)
            }`}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Question value dots */}
          {normalizedQuestionValues.map((angle, i) => {
            const x = 100 + 70 * Math.cos((Math.PI * (180 - angle)) / 180);
            const y = 90 - 70 * Math.sin((Math.PI * (180 - angle)) / 180);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill={color}
                opacity="0.6"
              />
            );
          })}

          {/* Main pointer */}
          <line
            x1="100"
            y1="90"
            x2={100 + 60 * Math.cos((Math.PI * (180 - normalizedValue)) / 180)}
            y2={90 - 60 * Math.sin((Math.PI * (180 - normalizedValue)) / 180)}
            stroke="#333"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Center dot - size based on variance */}
          <circle
            cx="100"
            cy="90"
            r={dotSize}
            fill={color}
            stroke="white"
            strokeWidth="2"
          />

          {/* Scale labels */}
          <text x="10" y="100" fontSize="10" fill="#666" textAnchor="start">
            {min}
          </text>
          <text x="100" y="15" fontSize="10" fill="#666" textAnchor="middle">
            50
          </text>
          <text x="190" y="100" fontSize="10" fill="#666" textAnchor="end">
            {max}
          </text>
        </svg>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {safeValue}
        </Typography>
        {questionValues.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'flex-end' }}>
            ({questionValues.length} questions)
          </Typography>
        )}
      </Box>
    </Box>
  );
}