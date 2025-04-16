// PencilTool.js
import React, { useState } from 'react';
import SplineDrawingBase from './SplineDrawingBase';

// Minimum pixel distance for final editing points
const POINT_DISTANCE_THRESHOLD = 30;

// Utility to downsample points by threshold
const filterPoints = (points, threshold) => {
  if (points.length === 0) return [];
  const filtered = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const last = filtered[filtered.length - 1];
    const pt = points[i];
    const dx = pt.x - last.x;
    const dy = pt.y - last.y;
    if (Math.hypot(dx, dy) >= threshold) {
      filtered.push(pt);
    }
  }
  return filtered;
};

const PencilTool = ({ id, initialSpline, onUpdate, onSelect, onDelete }) => {
  const [spline, setSpline] = useState(
    initialSpline || {
      id,
      points: [],
      strokeColor: '#000000',
      strokeWidth: 2,
      complete: false,
      opacity: 1,
    }
  );
  const [isDrawing, setIsDrawing] = useState(false);

  const handleMouseDown = e => {
    if (spline.complete) return;
    e.stopPropagation();
    setIsDrawing(true);
    const svgRect = e.currentTarget.getBoundingClientRect();
    const start = { x: e.clientX - svgRect.left, y: e.clientY - svgRect.top };
    const newSpline = { ...spline, points: [start] };
    setSpline(newSpline);
    onUpdate && onUpdate(newSpline);
  };

  const handleMouseMove = e => {
    if (!isDrawing || spline.complete) return;
    e.stopPropagation();
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;

    // Always add points during drawing for high-res feedback
    const newPoints = [...spline.points, { x, y }];
    const newSpline = { ...spline, points: newPoints };
    setSpline(newSpline);
    onUpdate && onUpdate(newSpline);
  };

  const handleMouseUp = e => {
    if (!isDrawing || spline.complete) return;
    e.stopPropagation();
    setIsDrawing(false);

    if (spline.points.length > 1) {
      // Downsample final points
      const filtered = filterPoints(spline.points, POINT_DISTANCE_THRESHOLD);
      const finished = { ...spline, points: filtered, complete: true };
      setSpline(finished);
      onUpdate && onUpdate(finished);
    }
  };

  const drawingHandlers = !spline.complete
    ? {
        onMouseDown: handleMouseDown,
        onMouseMove: handleMouseMove,
        onMouseUp: handleMouseUp,
        onMouseLeave: handleMouseUp,
        cursor: isDrawing ? 'crosshair' : 'default',
      }
    : {};

  return (
    <SplineDrawingBase
      spline={spline}
      updateSpline={updated => {
        setSpline(updated);
        onUpdate && onUpdate(updated);
      }}
      drawingHandlers={drawingHandlers}
      onSelectSpline={onSelect}
      onDeleteSpline={() => onDelete && onDelete(spline.id)}
    />
  );
};

export default PencilTool;
