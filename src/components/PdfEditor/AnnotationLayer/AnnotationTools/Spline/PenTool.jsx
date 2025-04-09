// PenTool.jsx
import React, { useEffect } from 'react';
import SplineAnnotationBase from './SplineAnnotationBase';

const PenTool = ({ annotation, updateAnnotation }) => {
  useEffect(() => {
    if (!annotation.points) {
      updateAnnotation({ ...annotation, points: [], complete: false });
    }
  }, [annotation, updateAnnotation]);

  const handleClick = (e) => {
    if (annotation.complete) return;
    e.stopPropagation();
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    const newPoints = [...(annotation.points || []), { x, y }];
    updateAnnotation({ ...annotation, points: newPoints });
  };

  // Pass drawingHandlers only when the annotation is not complete.
  const drawingHandlers = !annotation.complete ? { onClick: handleClick, cursor: 'pointer' } : undefined;
  
  const extraToolbarElements = (
    <label>
      <input
        type="checkbox"
        checked={annotation.complete || false}
        onChange={(e) => {
          updateAnnotation({ ...annotation, complete: e.target.checked });
        }}
      />
      Done
    </label>
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

export default PenTool;
