'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

interface ProfessionalSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  color?: string;
  description?: string;
  leftLabel?: string;
  rightLabel?: string;
}

export default function ProfessionalSlider({
  label,
  value,
  onChange,
  min = 1,
  max = 100,
  color = '#4A7C59',
  description,
  leftLabel,
  rightLabel
}: ProfessionalSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handlePointerEvent = (clientX: number) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newValue = Math.round(min + percentage * (max - min));

    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handlePointerEvent(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    handlePointerEvent(touch.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handlePointerEvent(e.clientX);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0];
      handlePointerEvent(touch.clientX);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging]);

  const percentage = ((localValue - min) / (max - min)) * 100;

  // Get range bands for each measure type
  const getRangeBands = () => {
    if (label.includes('Bucket')) {
      return [
        { range: '1-30', label: 'External Resources', desc: 'Rely on data, experts, perspectives' },
        { range: '31-70', label: 'Balanced', desc: 'Mix of external and internal' },
        { range: '71-100', label: 'Inner Knowing', desc: 'Trust intuition and inner sense' }
      ];
    }
    if (label.includes('Thickness')) {
      return [
        { range: '1-30', label: 'Flexible', desc: 'Quick to integrate new truths' },
        { range: '31-70', label: 'Moderate', desc: 'Balanced reassessment' },
        { range: '71-100', label: 'Persistent', desc: 'Hold truths until strong evidence' }
      ];
    }
    if (label.includes('Input')) {
      return [
        { range: '1-30', label: 'Quick Integration', desc: 'Change with little information' },
        { range: '31-70', label: 'Moderate Gathering', desc: 'Balanced information seeking' },
        { range: '71-100', label: 'Wide Research', desc: 'Multiple perspectives before changing' }
      ];
    }
    if (label.includes('Output')) {
      return [
        { range: '1-30', label: 'Internal', desc: 'Keep knowledge private' },
        { range: '31-70', label: 'Selective', desc: 'Share when appropriate' },
        { range: '71-100', label: 'Broadcast', desc: 'Eager to share and teach' }
      ];
    }
    return [];
  };

  return (
    <Box sx={{
      width: '100%',
      p: 3,
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      borderRadius: 3,
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      userSelect: 'none'
    }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mb: 0.5 }}>
          {label}
        </Typography>
        {description && (
          <Typography variant="body2" sx={{ color: '#666' }}>
            {description}
          </Typography>
        )}
      </Box>

      {/* Slider Container */}
      <Box sx={{ position: 'relative', mb: 4 }}>
        {/* Track with range bands */}
        <Box
          ref={trackRef}
          sx={{
            position: 'relative',
            height: 12,
            background: 'linear-gradient(90deg, #f0f0f0 0%, #f0f0f0 30%, #e0e0e0 30%, #e0e0e0 70%, #d0d0d0 70%, #d0d0d0 100%)',
            borderRadius: 6,
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
            cursor: isDragging ? 'grabbing' : 'grab',
            my: 4
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Scale marks - show 10 major marks */}
          {[...Array(11)].map((_, i) => {
            const markPercentage = (i / 10) * 100;
            const markValue = min + (i / 10) * (max - min);
            return (
              <Box key={i} sx={{ position: 'absolute', left: `${markPercentage}%` }}>
                <Box
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: i % 5 === 0 ? 3 : 1,
                    height: i % 5 === 0 ? 20 : 12,
                    bgcolor: i % 5 === 0 ? '#999' : '#ccc',
                    zIndex: 1
                  }}
                />
                {i % 5 === 0 && (
                  <Typography
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      top: 25,
                      transform: 'translateX(-50%)',
                      fontSize: 10,
                      color: '#999',
                      userSelect: 'none'
                    }}
                  >
                    {Math.round(markValue)}
                  </Typography>
                )}
              </Box>
            );
          })}

          {/* Thumb */}
          <Box
            sx={{
              position: 'absolute',
              left: `${percentage}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 28,
              height: 28,
              bgcolor: color,
              borderRadius: '50%',
              boxShadow: isDragging ? '0 0 0 12px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.3)',
              border: '3px solid white',
              zIndex: 3,
              transition: isDragging ? 'none' : 'all 0.3s ease',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
          />

          {/* Value indicator while dragging */}
          {isDragging && (
            <Box
              sx={{
                position: 'absolute',
                left: `${percentage}%`,
                top: -35,
                transform: 'translateX(-50%)',
                px: 1.5,
                py: 0.5,
                bgcolor: '#333',
                color: 'white',
                borderRadius: 1,
                fontSize: 14,
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              {localValue}
            </Box>
          )}
        </Box>

        {/* Labels */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 1,
          px: 2
        }}>
          <Typography variant="caption" sx={{ color: '#999' }}>
            {leftLabel || min}
          </Typography>
          <Typography variant="caption" sx={{ color: '#999' }}>
            {rightLabel || max}
          </Typography>
        </Box>
      </Box>

      {/* Range Bands */}
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
          {getRangeBands().map((band, index) => (
            <Box
              key={index}
              sx={{
                flex: 1,
                p: 1.5,
                bgcolor: localValue >= parseInt(band.range.split('-')[0]) &&
                         localValue <= parseInt(band.range.split('-')[1])
                         ? `${color}15` : 'transparent',
                border: localValue >= parseInt(band.range.split('-')[0]) &&
                        localValue <= parseInt(band.range.split('-')[1])
                        ? `2px solid ${color}` : '1px solid #e0e0e0',
                borderRadius: 1,
                transition: 'all 0.3s ease'
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  fontWeight: 'bold',
                  color: localValue >= parseInt(band.range.split('-')[0]) &&
                         localValue <= parseInt(band.range.split('-')[1])
                         ? color : '#666',
                  mb: 0.5
                }}
              >
                {band.range}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: localValue >= parseInt(band.range.split('-')[0]) &&
                              localValue <= parseInt(band.range.split('-')[1])
                              ? 'bold' : 'normal',
                  color: localValue >= parseInt(band.range.split('-')[0]) &&
                         localValue <= parseInt(band.range.split('-')[1])
                         ? '#333' : '#666',
                  mb: 0.5
                }}
              >
                {band.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#999',
                  fontSize: '0.75rem'
                }}
              >
                {band.desc}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}