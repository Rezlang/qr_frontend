// PencilTool.jsx
import React, { useState } from 'react';
import SplineDrawingBase from './SplineDrawingBase';

const POINT_DISTANCE_THRESHOLD = 30;
const filterPoints = (points, threshold) => {
  if (points.length === 0) return [];
  const out = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const last = out[out.length - 1];
    const pt = points[i];
    if (Math.hypot(pt.x - last.x, pt.y - last.y) >= threshold) {
      out.push(pt);
    }
  }
  return out;
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
    const { left, top } = e.currentTarget.getBoundingClientRect();
    const start = { x: e.clientX - left, y: e.clientY - top };
    const next = { ...spline, points: [start] };
    setSpline(next);
    onUpdate?.(next);
  };

  const handleMouseMove = e => {
    if (!isDrawing || spline.complete) return;
    e.stopPropagation();
    const { left, top } = e.currentTarget.getBoundingClientRect();
    const pt = { x: e.clientX - left, y: e.clientY - top };
    const next = { ...spline, points: [...spline.points, pt] };
    setSpline(next);
    onUpdate?.(next);
  };

  const finishDrawing = () => {
    if (!isDrawing || spline.complete) return;
    setIsDrawing(false);
    if (spline.points.length > 1) {
      const filtered = filterPoints(spline.points, POINT_DISTANCE_THRESHOLD);
      const done = { ...spline, points: filtered, complete: true };
      setSpline(done);
      onUpdate?.(done);
    }
  };

  const drawingHandlers = !spline.complete
    ? {
        onMouseDown: handleMouseDown,
        onMouseMove: handleMouseMove,
        onMouseUp: finishDrawing,
        onMouseLeave: finishDrawing,
        cursor: isDrawing ? 'crosshair' : 'default',
      }
    : {};

  return (
    <SplineDrawingBase
      spline={spline}
      previewPoint={null}
      toolType="pencil"
      updateSpline={u => {
        setSpline(u);
        onUpdate?.(u);
      }}
      drawingHandlers={drawingHandlers}
      onSelectSpline={onSelect}
      onDeleteSpline={() => onDelete?.(spline.id)}
    />
  );
};

export default PencilTool;
