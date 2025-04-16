// PenTool.jsx
import React, { useState } from 'react';
import SplineDrawingBase from './SplineDrawingBase';

const PenTool = ({ id, initialSpline, onUpdate, onSelect, onDelete }) => {
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
  const [previewPoint, setPreviewPoint] = useState(null);

  const handleClick = e => {
    if (spline.complete) return;
    // ignore click events beyond the first (so the 2nd click of a dbl-click doesn’t add a point)
    if (e.detail > 1) return;

    e.stopPropagation();
    const { left, top } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const next = { ...spline, points: [...spline.points, { x, y }] };
    setSpline(next);
    onUpdate?.(next);
  };

  const handleDoubleClick = e => {
    if (!spline.complete && spline.points.length > 1) {
      e.stopPropagation();
      const done = { ...spline, complete: true };
      setSpline(done);
      onUpdate?.(done);
      setPreviewPoint(null);
    }
  };

  const handleMouseMove = e => {
    if (spline.complete) return;
    const { left, top } = e.currentTarget.getBoundingClientRect();
    setPreviewPoint({ x: e.clientX - left, y: e.clientY - top });
  };

  const handleMouseLeave = () => setPreviewPoint(null);

  const drawingHandlers = !spline.complete
    ? {
        onClick: handleClick,
        onDoubleClick: handleDoubleClick,
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave,
        cursor: 'crosshair',
      }
    : {};

  return (
    <SplineDrawingBase
      spline={spline}
      previewPoint={previewPoint}
      toolType="pen"
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

export default PenTool;
