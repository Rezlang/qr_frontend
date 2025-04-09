// PencilTool.jsx
import React, { useState, useEffect } from 'react';
import SplineAnnotationBase from './SplineAnnotationBase';

const PencilTool = ({ annotation, updateAnnotation }) => {
  const [drawingPoints, setDrawingPoints] = useState(annotation.points || []);
  const [isDrawing, setIsDrawing] = useState(false);
  const POINT_DISTANCE_THRESHOLD = 20;

  useEffect(() => {
    if (!annotation.points || annotation.points.length === 0) {
      const initialPoint = { x: annotation.width / 2, y: annotation.height / 2 };
      updateAnnotation({ ...annotation, points: [initialPoint], complete: false });
      setDrawingPoints([initialPoint]);
    }
  }, [annotation, updateAnnotation]);

  const handleMouseDown = (e) => {
    if (annotation.complete) return;
    e.stopPropagation();
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    setIsDrawing(true);
    const newPoints = [{ x, y }];
    setDrawingPoints(newPoints);
    updateAnnotation({ ...annotation, points: newPoints, complete: false });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    e.stopPropagation();
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    if (drawingPoints.length > 0) {
      const last = drawingPoints[drawingPoints.length - 1];
      const dx = x - last.x;
      const dy = y - last.y;
      if (Math.sqrt(dx * dx + dy * dy) < POINT_DISTANCE_THRESHOLD) return;
    }
    const newPoints = [...drawingPoints, { x, y }];
    setDrawingPoints(newPoints);
    updateAnnotation({ ...annotation, points: newPoints, complete: false });
  };

  const handleMouseUp = (e) => {
    if (!isDrawing) return;
    e.stopPropagation();
    setIsDrawing(false);
    if (drawingPoints.length < 2) {
      updateAnnotation({ ...annotation, points: [], complete: false });
      setDrawingPoints([]);
      return;
    }
    updateAnnotation({ ...annotation, points: drawingPoints, complete: true });
  };

  // Only pass free-draw handlers when drawing is in progress.
  const drawingHandlers = !annotation.complete ? {
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseUp,
    cursor: isDrawing ? 'crosshair' : 'default'
  } : undefined;

  return (
    <SplineAnnotationBase
      annotation={annotation}
      updateAnnotation={updateAnnotation}
      drawingHandlers={drawingHandlers}
    />
  );
};

export default PencilTool;
