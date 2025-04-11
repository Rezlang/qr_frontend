import React, { useState, useEffect, useRef } from 'react';
import SplineAnnotationBase from './SplineAnnotationBase';

const HighlighterTool = ({ annotation, updateAnnotation }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!annotation.points || annotation.points.length === 0) {
      updateAnnotation({
        ...annotation,
        points: [],
        strokeColor: annotation.strokeColor || '#ffff00',
        strokeWidth: annotation.strokeWidth || 8,
        opacity: annotation.opacity ?? 0.5,
        complete: false,
      });
    }
  }, [annotation, updateAnnotation]);

  const handleMouseDown = (e) => {
    if (annotation.complete) return;
    e.stopPropagation();
    const svgRect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    setStartPoint({ x, y });
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !startPoint) return;
    e.stopPropagation();
    const svgRect = svgRef.current.getBoundingClientRect();
    let x = e.clientX - svgRect.left;
    let y = e.clientY - svgRect.top;

    // Constrain to horizontal unless Shift is held
    if (!e.shiftKey) {
      y = startPoint.y;
    }

    const newPoints = [startPoint, { x, y }];
    updateAnnotation({
      ...annotation,
      points: newPoints,
      complete: false,
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (annotation.points.length === 2) {
      updateAnnotation({ ...annotation, complete: true });
    } else {
      updateAnnotation({ ...annotation, points: [], complete: false });
    }
  };

  const drawingHandlers = !annotation.complete
    ? {
        ref: svgRef,
        onMouseDown: handleMouseDown,
        onMouseMove: handleMouseMove,
        onMouseUp: handleMouseUp,
        onMouseLeave: handleMouseUp,
        cursor: 'crosshair',
      }
    : { ref: svgRef };

  const extraToolbarElements = (
    <>
      <label>Opacity:</label>
      <input
        type="range"
        min="0.1"
        max="1"
        step="0.05"
        value={annotation.opacity ?? 0.5}
        onChange={(e) =>
          updateAnnotation({ ...annotation, opacity: parseFloat(e.target.value) })
        }
        style={{ width: '60px' }}
      />
      <span>{Math.round((annotation.opacity ?? 0.5) * 100)}%</span>
    </>
  );

  return (
    <SplineAnnotationBase
      annotation={annotation}
      updateAnnotation={updateAnnotation}
      drawingHandlers={drawingHandlers}
      extraToolbarElements={extraToolbarElements}
    />
  );
};

export default HighlighterTool;
