'use client';

import React, { useRef } from 'react';
import { Box, Typography } from '@mui/material';

interface CircularSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export default function CircularSlider({
  value,
  onChange,
  min = 1,
  max = 100,
  disabled = false
}: CircularSliderProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Convert value to rotation angle (dial rotates, pointer stays at top)
  const valueToRotation = (val: number) => {
    // Scale starts at bottom (Root-Leaf center) and goes clockwise
    // Value 1 is at bottom (180°), going clockwise to 100 (just before 180° again)
    // We need to rotate the dial to bring the current value to the top pointer
    // For value 1, we need to rotate 180° to bring bottom to top
    // For value 50, we need to rotate 0° (already at top)
    // For value 100, we need to rotate -180° (almost full circle)
    const angle = ((val - 1) / 100) * 360;
    return 180 - angle;
  };

  // Handle click on a wedge to rotate it to the top
  const handleWedgeClick = (targetValue: number) => {
    if (disabled) return;

    // Calculate the midpoint of the clicked wedge's range
    // This will center the wedge at the top when clicked
    onChange(targetValue);
  };

  const rotation = valueToRotation(value);

  // Subtype labels based on value (8 evenly distributed types, 12.5 units each)
  const getSubtypeLabel = (val: number) => {
    // Each type spans 12.5 units
    // Root-Leaf is centered at bottom (wraps from 94.25 to 6.25)
    if (val <= 6.25 || val > 93.75) return 'Root-Leaf';
    if (val <= 18.75) return 'Root';        // 6.25 to 18.75
    if (val <= 31.25) return 'Root-Trunk';  // 18.75 to 31.25
    if (val <= 43.75) return 'Trunk';       // 31.25 to 43.75
    if (val <= 56.25) return 'Trunk-Branch'; // 43.75 to 56.25 (center at 50)
    if (val <= 68.75) return 'Branch';      // 56.25 to 68.75
    if (val <= 81.25) return 'Branch-Leaf'; // 68.75 to 81.25
    if (val <= 93.75) return 'Leaf';        // 81.25 to 93.75
    return 'Root-Leaf';
  };

  // Subtypes positioned on the dial based on 1-100 scale
  // The dial labels need to be shifted -90° to align correctly
  // When the dial rotates to show a value at top, the label should match
  const subtypes = [
    { name: 'Root-Leaf', angle: 90, displayName: ['Root/', 'Leaf'], centerValue: 1 },     // Values 94-6, center at 1
    { name: 'Root', angle: 135, displayName: ['Root'], centerValue: 13 },                  // Values 7-19, center at 13
    { name: 'Root-Trunk', angle: 180, displayName: ['Root/', 'Trunk'], centerValue: 25 },  // Values 20-31, center at 25
    { name: 'Trunk', angle: 225, displayName: ['Trunk'], centerValue: 38 },                // Values 32-44, center at 38
    { name: 'Trunk-Branch', angle: 270, displayName: ['Trunk/', 'Branch'], centerValue: 50 }, // Values 45-56, center at 50
    { name: 'Branch', angle: 315, displayName: ['Branch'], centerValue: 63 },              // Values 57-69, center at 63
    { name: 'Branch-Leaf', angle: 0, displayName: ['Branch/', 'Leaf'], centerValue: 75 },  // Values 70-81, center at 75
    { name: 'Leaf', angle: 45, displayName: ['Leaf'], centerValue: 88 }                    // Values 82-94, center at 88
  ];

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      userSelect: 'none'
    }}>
      <svg
        ref={svgRef}
        width="400"
        height="400"
        viewBox="0 0 400 400"
        style={{ cursor: disabled ? 'default' : 'pointer' }}
      >
        {/* Drop shadow for the dial */}
        <defs>
          <filter id="dialShadow">
            <feDropShadow dx="0" dy="3" stdDeviation="6" floodOpacity="0.25"/>
          </filter>
        </defs>

        {/* Outer ring (stationary) */}
        <circle
          cx="200"
          cy="200"
          r="140"
          fill="none"
          stroke="#ccc"
          strokeWidth="2"
        />

        {/* Rotating group for the dial */}
        <g transform={`rotate(${rotation} 200 200)`}>
          {/* Background circle */}
          <circle
            cx="200"
            cy="200"
            r="120"
            fill="white"
            stroke="#ddd"
            strokeWidth="2"
            filter="url(#dialShadow)"
          />

          {/* Colored segments */}
          {subtypes.map((st, index) => {
            // Each segment is 45° (360/8), centered on the subtype angle
            const startAngle = st.angle - 22.5;
            const endAngle = st.angle + 22.5;
            const startRad = startAngle * (Math.PI / 180);
            const endRad = endAngle * (Math.PI / 180);

            const x1 = 200 + 120 * Math.cos(startRad);
            const y1 = 200 + 120 * Math.sin(startRad);
            const x2 = 200 + 120 * Math.cos(endRad);
            const y2 = 200 + 120 * Math.sin(endRad);

            const isCurrentWedge = getSubtypeLabel(value) === st.name;

            return (
              <path
                key={st.name}
                d={`M 200 200 L ${x1} ${y1} A 120 120 0 0 1 ${x2} ${y2} Z`}
                fill={isCurrentWedge ? '#4A7C59' : '#f5f5f5'}
                fillOpacity={isCurrentWedge ? 0.2 : 0.3}
                stroke={isCurrentWedge ? '#4A7C59' : '#ccc'}
                strokeWidth={isCurrentWedge ? "2" : "1"}
                style={{
                  cursor: disabled ? 'default' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleWedgeClick(st.centerValue)}
                onMouseEnter={(e) => {
                  if (!disabled && !isCurrentWedge) {
                    e.currentTarget.setAttribute('fill', '#4A7C59');
                    e.currentTarget.setAttribute('fillOpacity', '0.15');
                    e.currentTarget.setAttribute('stroke', '#4A7C59');
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disabled && !isCurrentWedge) {
                    e.currentTarget.setAttribute('fill', '#f5f5f5');
                    e.currentTarget.setAttribute('fillOpacity', '0.3');
                    e.currentTarget.setAttribute('stroke', '#ccc');
                  }
                }}
              />
            );
          })}

          {/* Tick marks at segment boundaries */}
          {subtypes.map(st => {
            const tickAngle = st.angle - 22.5; // Tick at start of each segment
            const tickRad = tickAngle * (Math.PI / 180);
            const x1 = 200 + 105 * Math.cos(tickRad);
            const y1 = 200 + 105 * Math.sin(tickRad);
            const x2 = 200 + 120 * Math.cos(tickRad);
            const y2 = 200 + 120 * Math.sin(tickRad);
            return (
              <line
                key={st.name}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#999"
                strokeWidth="2"
                style={{ pointerEvents: 'none' }}
              />
            );
          })}

          {/* Subtype labels (rotate with dial) */}
          {subtypes.map(st => {
            const labelRad = st.angle * (Math.PI / 180);
            const x = 200 + 85 * Math.cos(labelRad);
            const y = 200 + 85 * Math.sin(labelRad);
            const isActive = getSubtypeLabel(value) === st.name;

            if (st.displayName.length === 1) {
              return (
                <text
                  key={st.name}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="13"
                  fill={isActive ? '#4A7C59' : '#666'}
                  fontWeight={isActive ? 'bold' : 'normal'}
                  transform={`rotate(${-rotation} ${x} ${y})`}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {st.displayName[0]}
                </text>
              );
            } else {
              // For wrapped text (compound names)
              return (
                <g key={st.name} transform={`rotate(${-rotation} ${x} ${y})`} style={{ pointerEvents: 'none' }}>
                  <text
                    x={x}
                    y={y - 7}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    fill={isActive ? '#4A7C59' : '#666'}
                    fontWeight={isActive ? 'bold' : 'normal'}
                    style={{ userSelect: 'none' }}
                  >
                    {st.displayName[0]}
                  </text>
                  <text
                    x={x}
                    y={y + 7}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    fill={isActive ? '#4A7C59' : '#666'}
                    fontWeight={isActive ? 'bold' : 'normal'}
                    style={{ userSelect: 'none' }}
                  >
                    {st.displayName[1]}
                  </text>
                </g>
              );
            }
          })}

          {/* Inner circle */}
          <circle
            cx="200"
            cy="200"
            r="40"
            fill="white"
            stroke="#ddd"
            strokeWidth="1"
            style={{ pointerEvents: 'none' }}
          />

          {/* Center value display */}
          <text
            x="200"
            y="200"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="28"
            fontWeight="bold"
            fill="#333"
            transform={`rotate(${-rotation} 200 200)`} // Keep text upright
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {value}
          </text>
        </g>

        {/* Highlight segment at top (stationary) - centered on top position */}
        <path
          d="M 200 200 L 178.48 85.36 A 120 120 0 0 1 221.52 85.36 Z"
          fill="#4A7C59"
          fillOpacity="0.3"
          stroke="#4A7C59"
          strokeWidth="2"
        />

        {/* Fixed pointer at top (north) */}
        <g>
          {/* Pointer triangle */}
          <path
            d="M 200 55 L 193 40 L 207 40 Z"
            fill="#4A7C59"
            stroke="white"
            strokeWidth="2"
          />
          {/* Pointer line */}
          <line
            x1="200"
            y1="55"
            x2="200"
            y2="75"
            stroke="#4A7C59"
            strokeWidth="4"
          />
        </g>

        {/* Current subtype label at top */}
        <text
          x="200"
          y="25"
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill="#4A7C59"
        >
          {getSubtypeLabel(value)}
        </text>
      </svg>
    </Box>
  );
}