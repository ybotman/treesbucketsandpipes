'use client';

import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';
import type { MeasureData } from '@/types/measures';

interface EnhancedGaugeProps {
  title: string;
  value: number;
  measureData: MeasureData;
  color?: string;
  questionValues?: number[];
}

export default function EnhancedGauge({
  title,
  value,
  measureData,
  color = '#4A7C59',
  questionValues = []
}: EnhancedGaugeProps) {
  const min = 1;
  const max = 100;
  const safeValue = value ?? min;
  const normalizedValue = ((safeValue - min) / (max - min)) * 180;

  // Determine which band the value falls into
  const activeBand = useMemo(() => {
    return measureData.bands.find(band =>
      safeValue >= band.range[0] && safeValue <= band.range[1]
    );
  }, [safeValue, measureData.bands]);

  const normalizedQuestionValues = useMemo(() => {
    return questionValues.map(v => ((v - min) / (max - min)) * 180);
  }, [questionValues, min, max]);

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%'
    }}>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', color: '#333' }}>
        {title}
      </Typography>

      <Box sx={{ position: 'relative', width: 220, height: 140 }}>
        <svg width="220" height="140" viewBox="0 0 220 140">
          {/* Background bands with radial separation lines */}
          {measureData.bands.map((band, index) => {
            const startAngle = ((band.range[0] - min) / (max - min)) * 180;
            const endAngle = ((band.range[1] - min) / (max - min)) * 180;
            const isActive = band.id === activeBand?.id;

            return (
              <g key={band.id}>
                {/* Band arc segments with radial lines */}
                <path
                  d={`M ${110 + 60 * Math.cos((Math.PI * (180 - startAngle)) / 180)} ${
                    110 - 60 * Math.sin((Math.PI * (180 - startAngle)) / 180)
                  } L ${110 + 90 * Math.cos((Math.PI * (180 - startAngle)) / 180)} ${
                    110 - 90 * Math.sin((Math.PI * (180 - startAngle)) / 180)
                  } A 90 90 0 ${endAngle - startAngle > 90 ? 1 : 0} 1 ${
                    110 + 90 * Math.cos((Math.PI * (180 - endAngle)) / 180)
                  } ${
                    110 - 90 * Math.sin((Math.PI * (180 - endAngle)) / 180)
                  } L ${110 + 60 * Math.cos((Math.PI * (180 - endAngle)) / 180)} ${
                    110 - 60 * Math.sin((Math.PI * (180 - endAngle)) / 180)
                  } A 60 60 0 ${endAngle - startAngle > 90 ? 1 : 0} 0 ${
                    110 + 60 * Math.cos((Math.PI * (180 - startAngle)) / 180)
                  } ${
                    110 - 60 * Math.sin((Math.PI * (180 - startAngle)) / 180)
                  } Z`}
                  fill={isActive ? color : '#f8f8f8'}
                  fillOpacity={isActive ? 0.2 : 0.05}
                  stroke="#ddd"
                  strokeWidth="1"
                />

                {/* Radial divider lines at band boundaries */}
                {index < measureData.bands.length - 1 && (
                  <line
                    x1={110 + 60 * Math.cos((Math.PI * (180 - endAngle)) / 180)}
                    y1={110 - 60 * Math.sin((Math.PI * (180 - endAngle)) / 180)}
                    x2={110 + 90 * Math.cos((Math.PI * (180 - endAngle)) / 180)}
                    y2={110 - 90 * Math.sin((Math.PI * (180 - endAngle)) / 180)}
                    stroke="#ccc"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}

          {/* Main gauge arc outline */}
          <path
            d={`M 20 110 A 90 90 0 0 1 200 110`}
            fill="none"
            stroke="#ccc"
            strokeWidth="1"
            strokeLinecap="round"
          />

          {/* Question value dots */}
          {normalizedQuestionValues.map((angle, i) => {
            const x = 110 + 75 * Math.cos((Math.PI * (180 - angle)) / 180);
            const y = 110 - 75 * Math.sin((Math.PI * (180 - angle)) / 180);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="2"
                fill={color}
                opacity="0.4"
              />
            );
          })}

          {/* Main pointer */}
          <line
            x1="110"
            y1="110"
            x2={110 + 70 * Math.cos((Math.PI * (180 - normalizedValue)) / 180)}
            y2={110 - 70 * Math.sin((Math.PI * (180 - normalizedValue)) / 180)}
            stroke="#333"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Pointer tip */}
          <circle
            cx={110 + 70 * Math.cos((Math.PI * (180 - normalizedValue)) / 180)}
            cy={110 - 70 * Math.sin((Math.PI * (180 - normalizedValue)) / 180)}
            r="4"
            fill={color}
          />

          {/* Center dot */}
          <circle
            cx="110"
            cy="110"
            r="10"
            fill="white"
            stroke={color}
            strokeWidth="3"
          />

          {/* Band labels positioned outside the gauge */}
          {measureData.bands.map((band, index) => {
            const midAngle = ((band.range[0] + band.range[1]) / 2 - min) / (max - min) * 180;
            const labelRadius = 105;
            const x = 110 + labelRadius * Math.cos((Math.PI * (180 - midAngle)) / 180);
            const y = 110 - labelRadius * Math.sin((Math.PI * (180 - midAngle)) / 180);

            return (
              <text
                key={`label-${band.id}`}
                x={x}
                y={y}
                fontSize="9"
                fill={band.id === activeBand?.id ? color : '#999'}
                fontWeight={band.id === activeBand?.id ? 'bold' : 'normal'}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {band.title}
              </text>
            );
          })}

          {/* Scale labels */}
          <text x="20" y="125" fontSize="10" fill="#999" textAnchor="start">
            {measureData.scaleLabels.left}
          </text>
          <text x="200" y="125" fontSize="10" fill="#999" textAnchor="end">
            {measureData.scaleLabels.right}
          </text>
        </svg>
      </Box>

      {/* Active band display only */}
      <Box sx={{ textAlign: 'center', mt: 1 }}>
        {activeBand && (
          <Typography variant="h5" sx={{
            color: color,
            fontWeight: 'bold'
          }}>
            {activeBand.title}
          </Typography>
        )}
      </Box>
    </Box>
  );
}