// PencilTool.jsx
import React, { useState } from 'react';
import SplineDrawingBase from './SplineDrawingBase';

const PencilTool = ({ id, initialSpline, onUpdate, onSelect }) => {
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

  const handleMouseDown = (e) => {
    if (spline.complete) return;
    e.stopPropagation();
    setIsDrawing(true);
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    const newSpline = { ...spline, points: [{ x, y }] };
    setSpline(newSpline);
    onUpdate && onUpdate(newSpline);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || spline.complete) return;
    e.stopPropagation();
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    const newPoints = [...spline.points, { x, y }];
    const newSpline = { ...spline, points: newPoints };
    setSpline(newSpline);
    onUpdate && onUpdate(newSpline);
  };

  const handleMouseUp = (e) => {
    if (!isDrawing || spline.complete) return;
    e.stopPropagation();
    setIsDrawing(false);
    if (spline.points.length > 1) {
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
        cursor: isDrawing ? 'crosshair' : 'default',
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

export default PencilTool;
