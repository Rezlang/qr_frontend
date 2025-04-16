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
  // previewPoint holds the current mouse-over location
  const [previewPoint, setPreviewPoint] = useState(null);

  const handleClick = (e) => {
    if (spline.complete) return;
    e.stopPropagation();
    const { left, top } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const newPoints = [...spline.points, { x, y }];
    const newSpline = { ...spline, points: newPoints };
    setSpline(newSpline);
    onUpdate?.(newSpline);
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (!spline.complete && spline.points.length > 1) {
      const finished = { ...spline, complete: true };
      setSpline(finished);
      onUpdate?.(finished);
      setPreviewPoint(null);
    }
  };

  const handleMouseMove = (e) => {
    if (spline.complete) return;
    const { left, top } = e.currentTarget.getBoundingClientRect();
    setPreviewPoint({
      x: e.clientX - left,
      y: e.clientY - top,
    });
  };

  const handleMouseLeave = () => {
    setPreviewPoint(null);
  };

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
      updateSpline={(u) => {
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
