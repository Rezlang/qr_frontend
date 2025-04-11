// HighlighterTool.jsx
import React, { useState, useRef } from 'react';
import SplineDrawingBase from './SplineDrawingBase';

const HighlighterTool = ({ id, initialSpline, onUpdate, onSelect }) => {
  const [spline, setSpline] = useState(
    initialSpline || {
      id,
      points: [],
      strokeColor: '#ffff00',
      strokeWidth: 8,
      complete: false,
      opacity: 0.5,
    }
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);

  const handleMouseDown = (e) => {
    if (spline.complete) return;
    e.stopPropagation();
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    setStartPoint({ x, y });
    setIsDrawing(true);
    const newSpline = { ...spline, points: [{ x, y }] };
    setSpline(newSpline);
    onUpdate && onUpdate(newSpline);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !startPoint || spline.complete) return;
    e.stopPropagation();
    const svgRect = e.currentTarget.getBoundingClientRect();
    let x = e.clientX - svgRect.left;
    let y = e.clientY - svgRect.top;
    // Constrain to horizontal movement unless Shift is held.
    if (!e.shiftKey) {
      y = startPoint.y;
    }
    const newPoints = [startPoint, { x, y }];
    const newSpline = { ...spline, points: newPoints };
    setSpline(newSpline);
    onUpdate && onUpdate(newSpline);
  };

  const handleMouseUp = (e) => {
    if (!isDrawing || spline.complete) return;
    e.stopPropagation();
    setIsDrawing(false);
    // Finalize only if a valid line has been drawn.
    if (spline.points.length === 2) {
      const newSpline = { ...spline, complete: true };
      setSpline(newSpline);
      onUpdate && onUpdate(newSpline);
    }
  };

  const drawingHandlers = !spline.complete
    ? {
        onMouseDown: handleMouseDown,
        onMouseMove: handleMouseMove,
        onMouseUp: handleMouseUp,
        onMouseLeave: handleMouseUp,
        cursor: 'crosshair',
      }
    : {};

  return (
    <SplineDrawingBase
      spline={spline}
      updateSpline={(updated) => {
        setSpline(updated);
        onUpdate && onUpdate(updated);
      }}
      drawingHandlers={drawingHandlers}
      onSelect={onSelect}
    />
  );
};

export default HighlighterTool;
