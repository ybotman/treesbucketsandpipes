'use client';

import React from 'react';
import { Box } from '@mui/material';

interface TreeCompassProps {
  score: number;      // 1-99 position
  strength: number;   // 0-100 strength/purity
  subtype: string;
  animated?: boolean;
}

export default function TreeCompass({ score, strength, subtype, animated = true }: TreeCompassProps) {
  // Convert score (1-99) to angle in degrees
  // Score 1 = 0°, Score 99 = 360°
  const angle = ((score - 1) / 98) * 360;
  
  // Calculate arrow endpoint based on strength
  // Strength affects how far from center the arrow extends
  const arrowLength = 30 + (strength / 100) * 60; // 30-90% of radius
  
  // Convert to radians for calculation
  const radians = (angle - 90) * (Math.PI / 180); // -90 to start from top
  
  // Calculate arrow endpoint
  const endX = 150 + arrowLength * Math.cos(radians);
  const endY = 150 + arrowLength * Math.sin(radians);
  
  // Subtype labels and positions
  const subtypes = [
    { name: 'Root', angle: 0, x: 250, y: 150 },
    { name: 'Root-Trunk', angle: 45, x: 220, y: 80 },
    { name: 'Trunk', angle: 90, x: 150, y: 50 },
    { name: 'Trunk-Branch', angle: 135, x: 80, y: 80 },
    { name: 'Branch', angle: 180, x: 50, y: 150 },
    { name: 'Branch-Leaf', angle: 225, x: 80, y: 220 },
    { name: 'Leaf', angle: 270, x: 150, y: 250 },
    { name: 'Leaf-Root', angle: 315, x: 220, y: 220 }
  ];
  
  // Highlight color for active subtype
  const getSubtypeColor = (subtypeName: string) => {
    const normalizedSubtype = subtype.replace('_', '-').toLowerCase();
    const normalizedName = subtypeName.toLowerCase();
    return normalizedName === normalizedSubtype ? '#2196f3' : '#666';
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      width: '100%',
      height: 300,
      position: 'relative'
    }}>
      <svg width="300" height="300" viewBox="0 0 300 300">
        {/* Background circle */}
        <circle
          cx="150"
          cy="150"
          r="100"
          fill="none"
          stroke="#ddd"
          strokeWidth="2"
        />
        
        {/* Dividing lines for 8 sections */}
        {[0, 45, 90, 135].map(rotation => (
          <line
            key={rotation}
            x1="150"
            y1="150"
            x2="150"
            y2="50"
            stroke="#eee"
            strokeWidth="1"
            transform={`rotate(${rotation} 150 150)`}
          />
        ))}
        
        {/* Inner circle for center */}
        <circle
          cx="150"
          cy="150"
          r="5"
          fill="#666"
        />
        
        {/* Subtype labels */}
        {subtypes.map(st => (
          <text
            key={st.name}
            x={st.x}
            y={st.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14"
            fill={getSubtypeColor(st.name)}
            fontWeight={getSubtypeColor(st.name) === '#2196f3' ? 'bold' : 'normal'}
          >
            {st.name}
          </text>
        ))}
        
        {/* Arrow showing position and strength */}
        <line
          x1="150"
          y1="150"
          x2={endX}
          y2={endY}
          stroke="#4caf50"
          strokeWidth="4"
          markerEnd="url(#arrowhead)"
          style={{
            transition: animated ? 'all 0.5s ease' : 'none'
          }}
        />
        
        {/* Arrow head definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3, 0 6"
              fill="#4caf50"
            />
          </marker>
        </defs>
        
        {/* Glow effect at arrow tip */}
        <circle
          cx={endX}
          cy={endY}
          r="8"
          fill="#4caf50"
          opacity="0.3"
          style={{
            transition: animated ? 'all 0.5s ease' : 'none'
          }}
        >
          <animate
            attributeName="r"
            values="8;12;8"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.3;0.1;0.3"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </Box>
  );
}