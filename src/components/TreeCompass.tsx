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
  // The scale starts at the bottom with Leaf-Root (score 1) and goes clockwise
  // Score 1-6: Leaf-Root (bottom, 180°)
  // Score 7-18: Root (bottom-right, ~202.5°)
  // Score 19-31: Root-Trunk (right, ~247.5°)
  // Score 32-43: Trunk (top-right, ~292.5°)
  // Score 44-56: Trunk-Branch (top, ~337.5°/0°)
  // Score 57-68: Branch (top-left, ~22.5°)
  // Score 69-81: Branch-Leaf (left, ~67.5°)
  // Score 82-93: Leaf (bottom-left, ~112.5°)
  // Score 94-99: back to Leaf-Root (approaching bottom, ~157.5°)

  // Start at bottom (180°) and go clockwise
  const angle = 180 + ((score - 1) / 98) * 360;

  // Calculate arrow endpoint based on strength
  // Strength affects how far from center the arrow extends
  const arrowLength = 30 + (strength / 100) * 60; // 30-90% of radius

  // Convert to radians for calculation
  const radians = angle * (Math.PI / 180);

  // Calculate arrow endpoint
  const endX = 150 + arrowLength * Math.sin(radians);
  const endY = 150 - arrowLength * Math.cos(radians);

  // Subtype labels and positions - arranged in circle starting from bottom
  const subtypes = [
    { name: 'Leaf-Root', angle: 180, x: 150, y: 260 },     // Bottom
    { name: 'Root', angle: 225, x: 210, y: 240 },          // Bottom-right
    { name: 'Root-Trunk', angle: 270, x: 260, y: 150 },    // Right
    { name: 'Trunk', angle: 315, x: 210, y: 60 },          // Top-right
    { name: 'Trunk-Branch', angle: 0, x: 150, y: 40 },     // Top
    { name: 'Branch', angle: 45, x: 90, y: 60 },           // Top-left
    { name: 'Branch-Leaf', angle: 90, x: 40, y: 150 },     // Left
    { name: 'Leaf', angle: 135, x: 90, y: 240 }            // Bottom-left
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