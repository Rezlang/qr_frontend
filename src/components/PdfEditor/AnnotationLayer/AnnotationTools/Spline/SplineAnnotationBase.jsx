// SplineAnnotationBase.jsx
import React, { useState, useRef, useEffect } from 'react';

const SplineAnnotationBase = ({
  annotation,
  updateAnnotation,
  drawingHandlers, // may be undefined if not needed
  extraToolbarElements = null // default now null (not {}!) 
}) => {
  const [selected, setSelected] = useState(false);
  const svgRef = useRef(null);

  // Listen for clicks outside the SVG to deselect the spline.
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (svgRef.current && !svgRef.current.contains(e.target)) {
        setSelected(false);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  // Spline interpolation (Catmull-Rom) function.
  const interpolate = (points, numOfSegments = 16) => {
    const result = [];
    if (points.length < 2) return points;
    const pts = [points[0], ...points, points[points.length - 1]];
    for (let i = 1; i < pts.length - 2; i++) {
      for (let j = 0; j < numOfSegments; j++) {
        const t = j / numOfSegments;
        const t2 = t * t;
        const t3 = t2 * t;
        const { x: x0, y: y0 } = pts[i - 1];
        const { x: x1, y: y1 } = pts[i];
        const { x: x2, y: y2 } = pts[i + 1];
        const { x: x3, y: y3 } = pts[i + 2];
        const x = 0.5 * (
          (2 * x1) +
          (-x0 + x2) * t +
          (2 * x0 - 5 * x1 + 4 * x2 - x3) * t2 +
          (-x0 + 3 * x1 - 3 * x2 + x3) * t3
        );
        const y = 0.5 * (
          (2 * y1) +
          (-y0 + y2) * t +
          (2 * y0 - 5 * y1 + 4 * y2 - y3) * t2 +
          (-y0 + 3 * y1 - 3 * y2 + y3) * t3
        );
        result.push({ x, y });
      }
    }
    result.push(points[points.length - 1]);
    return result;
  };

  // Helper: move a control point.
  const handlePointDrag = (index, newX, newY) => {
    const boundedX = Math.max(0, Math.min(newX, annotation.width));
    const boundedY = Math.max(0, Math.min(newY, annotation.height));
    const newPoints = annotation.points.map((p, i) => i === index ? { x: boundedX, y: boundedY } : p);
    updateAnnotation({ ...annotation, points: newPoints });
  };

  // If drawingHandlers isn’t provided, use a default when annotation is complete.
  const defaultDrawingHandlers = annotation.complete ? {
    onClick: (e) => {
      e.stopPropagation();
      setSelected(true);
    }
    // You can add onDoubleClick here if desired.
  } : {};

  const mergedDrawingHandlers = drawingHandlers || defaultDrawingHandlers;

  const splinePoints =
    annotation.complete && annotation.points && annotation.points.length > 0
      ? interpolate(annotation.points)
      : annotation.points;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0 }}>
      <svg
        ref={svgRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: annotation.width,
          height: annotation.height,
          pointerEvents: 'auto',
          cursor: mergedDrawingHandlers.cursor || 'default'
        }}
        {...mergedDrawingHandlers}
      >
        {splinePoints && splinePoints.length > 0 && (
          <polyline
            points={splinePoints.map(p => `${p.x},${p.y}`).join(' ')}
            stroke={annotation.strokeColor || 'black'}
            strokeWidth={annotation.strokeWidth || 2}
            strokeOpacity={annotation.opacity ?? 1}
            fill="none"
          />
        )}

        {selected && annotation.complete && annotation.points &&
          annotation.points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill="blue"
              fillOpacity="0.5"
              style={{ cursor: 'move' }}
              onMouseDown={(e) => {
                e.stopPropagation();
                const circleElement = e.currentTarget;
                const startDrag = (moveEvent) => {
                  const ownerSVG = circleElement.ownerSVGElement;
                  if (!ownerSVG) return;
                  const svgRect = ownerSVG.getBoundingClientRect();
                  const newX = moveEvent.clientX - svgRect.left;
                  const newY = moveEvent.clientY - svgRect.top;
                  handlePointDrag(i, newX, newY);
                };
                const stopDrag = () => {
                  document.removeEventListener('mousemove', startDrag);
                  document.removeEventListener('mouseup', stopDrag);
                };
                document.addEventListener('mousemove', startDrag);
                document.addEventListener('mouseup', stopDrag);
              }}
            />
          ))
        }
      </svg>

      {/* Toolbar for color, width, & extra controls */}
      <div
        style={{
          position: 'absolute',
          top: annotation.height + 5,
          left: 0,
          width: annotation.width,
          background: 'white',
          border: '1px solid #ccc',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <label>Color:</label>
        <input
          type="color"
          value={annotation.strokeColor || '#000000'}
          onChange={(e) => updateAnnotation({ ...annotation, strokeColor: e.target.value })}
          style={{ width: '24px', height: '24px' }}
        />
        <label>Width:</label>
        <input
          type="range"
          min="1"
          max="10"
          value={annotation.strokeWidth || 2}
          onChange={(e) => updateAnnotation({ ...annotation, strokeWidth: Number(e.target.value) })}
          style={{ width: '60px' }}
        />
        <span>{annotation.strokeWidth || 2}px</span>
        {extraToolbarElements}
      </div>
    </div>
  );
};

export default SplineAnnotationBase;
