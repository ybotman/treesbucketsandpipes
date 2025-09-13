'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';

interface CircularSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function CircularSlider({
  value,
  onChange,
  min = 1,
  max = 100
}: CircularSliderProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  // Calculate value from mouse position
  const handlePointerEvent = (clientX: number, clientY: number) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    // Calculate angle from center (0° is right, 90° is down, etc.)
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Convert to our scale where 0° is top, going clockwise
    angle = angle + 90;
    if (angle < 0) angle += 360;

    // Adjust so bottom (180°) is where value 1 starts
    let valueAngle = angle - 180;
    if (valueAngle < 0) valueAngle += 360;

    // Convert angle to value (1-100 scale)
    const val = 1 + (valueAngle / 360) * 100;

    // Clamp to 1-100 range
    const clampedVal = Math.round(Math.max(1, Math.min(100, val)));
    onChange(clampedVal);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handlePointerEvent(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handlePointerEvent(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    handlePointerEvent(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0];
      handlePointerEvent(touch.clientX, touch.clientY);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging]);

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
    { name: 'Root-Leaf', angle: 90, displayName: ['Root/', 'Leaf'] },     // Values 94-6
    { name: 'Root', angle: 135, displayName: ['Root'] },                  // Values 7-19
    { name: 'Root-Trunk', angle: 180, displayName: ['Root/', 'Trunk'] },  // Values 20-31
    { name: 'Trunk', angle: 225, displayName: ['Trunk'] },                // Values 32-44
    { name: 'Trunk-Branch', angle: 270, displayName: ['Trunk/', 'Branch'] }, // Values 45-56
    { name: 'Branch', angle: 315, displayName: ['Branch'] },              // Values 57-69
    { name: 'Branch-Leaf', angle: 0, displayName: ['Branch/', 'Leaf'] },  // Values 70-81
    { name: 'Leaf', angle: 45, displayName: ['Leaf'] }                    // Values 82-94
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
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
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

            return (
              <path
                key={st.name}
                d={`M 200 200 L ${x1} ${y1} A 120 120 0 0 1 ${x2} ${y2} Z`}
                fill='#f5f5f5'
                fillOpacity={0.5}
                stroke="#ddd"
                strokeWidth="1"
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
                >
                  {st.displayName[0]}
                </text>
              );
            } else {
              // For wrapped text (compound names)
              return (
                <g key={st.name} transform={`rotate(${-rotation} ${x} ${y})`}>
                  <text
                    x={x}
                    y={y - 7}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    fill={isActive ? '#4A7C59' : '#666'}
                    fontWeight={isActive ? 'bold' : 'normal'}
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

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        Click or drag the dial to set your Tree score
      </Typography>
    </Box>
  );
}