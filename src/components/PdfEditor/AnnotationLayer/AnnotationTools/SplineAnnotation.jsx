import React, { useState, useEffect } from 'react';

const SplineAnnotation = ({ annotation, updateAnnotation }) => {
  const [selected, setSelected] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  // Use control points for drawing
  const [drawingPoints, setDrawingPoints] = useState(annotation.points || []);

  // Initialize with at least one point if points array is empty
  useEffect(() => {
    if (!annotation.points || annotation.points.length === 0) {
      const initialPoint = { x: annotation.width / 2, y: annotation.height / 2 };
      updateAnnotation({ 
        ...annotation, 
        points: [initialPoint],
        complete: false 
      });
      setDrawingPoints([initialPoint]);
    }
  }, [annotation, updateAnnotation]);

  // Cardinal spline (Catmull-Rom) interpolation function.
  // Given control points, returns a smooth set of points.
  const interpolate = (points, numOfSegments = 16) => {
    const result = [];
    if (points.length < 2) return points;
    // Duplicate endpoints to handle boundaries
    const pts = [points[0], ...points, points[points.length - 1]];
    for (let i = 1; i < pts.length - 2; i++) {
      for (let j = 0; j < numOfSegments; j++) {
        const t = j / numOfSegments;
        const t2 = t * t;
        const t3 = t2 * t;
        const p0 = pts[i - 1],
              p1 = pts[i],
              p2 = pts[i + 1],
              p3 = pts[i + 2];
        const x = 0.5 * (
          (2 * p1.x) +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
        );
        const y = 0.5 * (
          (2 * p1.y) +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
        );
        result.push({ x, y });
      }
    }
    // Ensure the last control point is included
    result.push(points[points.length - 1]);
    return result;
  };

  // Handle moving a control point.
  const handlePointDrag = (index, newX, newY) => {
    const boundedX = Math.max(0, Math.min(newX, annotation.width));
    const boundedY = Math.max(0, Math.min(newY, annotation.height));
    
    const newPoints = annotation.points.map((p, i) =>
      i === index ? { x: boundedX, y: boundedY } : p
    );
    updateAnnotation({ ...annotation, points: newPoints });
  };

  // Threshold (in pixels) to decide whether to add a new control point during drawing
  const POINT_DISTANCE_THRESHOLD = 10;

  // Drawing handlers – all coordinates are relative to the SVG.
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

    // Only add the point if it's sufficiently far from the last control point.
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

    // Once drawing is complete, update the annotation and use the control points as basis.
    updateAnnotation({ ...annotation, points: drawingPoints, complete: true });
  };

  // Define event handlers based on annotation state.
  const drawingHandlers = annotation.complete
    ? { onClick: (e) => { e.stopPropagation(); setSelected(!selected); } }
    : {
        onMouseDown: handleMouseDown,
        onMouseMove: handleMouseMove,
        onMouseUp: handleMouseUp,
        onMouseLeave: handleMouseUp,
      };

  // When complete, compute the interpolated (smooth) points for the polyline.
  const splinePoints = annotation.complete && annotation.points && annotation.points.length > 0 
    ? interpolate(annotation.points)
    : annotation.points;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        cursor: isDrawing ? 'crosshair' : 'default'
      }}
      {...drawingHandlers}
    >
      {splinePoints && splinePoints.length > 0 && (
        <polyline
          points={splinePoints
            .map((p) => `${p.x},${p.y}`)
            .join(' ')}
          stroke={annotation.strokeColor || 'black'}
          strokeWidth={annotation.strokeWidth || 2}
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
                      fillOpacity="0.5" // Make the circles translucent
                      style={{ cursor: 'move' }}
                      onMouseDown={(e) => {
                          e.stopPropagation();
                          // Capture the circle element immediately to avoid stale reference issues.
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
      
      {selected && annotation.complete && annotation.points && annotation.points.length > 0 && (
        <foreignObject
          x={0}
          y={0}
          width={annotation.width}
          height={30}
        >
          <div
            style={{
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
              onChange={(e) => {
                e.stopPropagation();
                updateAnnotation({
                  ...annotation,
                  strokeColor: e.target.value,
                });
              }}
              style={{ width: '24px', height: '24px' }}
            />
            
            <label>Width:</label>
            <input
              type="range"
              min="1"
              max="10"
              value={annotation.strokeWidth || 2}
              onChange={(e) => {
                e.stopPropagation();
                updateAnnotation({
                  ...annotation,
                  strokeWidth: Number(e.target.value),
                });
              }}
              style={{ width: '60px' }}
            />
            <span>{annotation.strokeWidth || 2}px</span>
          </div>
        </foreignObject>
      )}
    </svg>
  );
};

export default SplineAnnotation;
