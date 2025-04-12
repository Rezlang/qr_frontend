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

  const handleClick = (e) => {
    if (spline.complete) return;
    e.stopPropagation();
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    const newPoints = [...spline.points, { x, y }];
    const newSpline = { ...spline, points: newPoints };
    setSpline(newSpline);
    onUpdate && onUpdate(newSpline);
  };

  // On double click, mark the spline as complete
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (!spline.complete && spline.points.length > 1) {
      const newSpline = { ...spline, complete: true };
      setSpline(newSpline);
      onUpdate && onUpdate(newSpline);
    }
  };

  const drawingHandlers = !spline.complete
    ? {
        onClick: handleClick,
        onDoubleClick: handleDoubleClick,
        cursor: 'pointer',
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
      onDeleteSpline={() => onDelete && onDelete(spline.id)}
    />
  );
};

export default PenTool;
