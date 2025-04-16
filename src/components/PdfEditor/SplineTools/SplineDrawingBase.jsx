// SplineDrawingBase.jsx
import React, { useState, useRef, useEffect } from 'react';

const SplineDrawingBase = ({
  spline,
  previewPoint,              // ← now used below
  updateSpline,
  drawingHandlers,
  extraToolbarElements,
  onSelectSpline,
  onDeleteSpline
}) => {
  const [selected, setSelected] = useState(false);
  const svgRef = useRef(null);

  // Deselect when clicking outside
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (svgRef.current && !svgRef.current.contains(e.target)) {
        setSelected(false);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const isDrawing = drawingHandlers && Object.keys(drawingHandlers).length > 0;

  // Catmull‑Rom interpolation (unchanged)
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

  // Build a path string that includes previewPoint when drawing
  const getPathData = () => {
    const pts = previewPoint && !spline.complete
      ? [...spline.points, previewPoint]
      : spline.points;
    if (pts.length < 2) return '';
    const smooth = interpolate(pts);
    return smooth
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(' ');
  };

  // For a finished spline, show only the interpolated backbone
  const splinePoints =
    spline.complete && spline.points.length > 0
      ? interpolate(spline.points)
      : spline.points;

  const handleSplineClick = (e) => {
    e.stopPropagation();
    setSelected(true);
    onSelectSpline && onSelectSpline(spline.id);
  };

  return (
    <svg
      ref={svgRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 4,
        pointerEvents: isDrawing ? 'all' : 'none',
        cursor: drawingHandlers?.cursor || 'default'
      }}
      {...drawingHandlers}
    >
      {/* ——— Preview while drawing ——— */}
      {!spline.complete && previewPoint && (
        <>
          {/* Preview rubber‑band spline */}
          <path
            d={getPathData()}
            fill="none"
            stroke={spline.strokeColor || 'black'}
            strokeWidth={spline.strokeWidth || 2}
            strokeOpacity={spline.opacity ?? 1}
            pointerEvents="none"
          />
          {/* Preview point at cursor */}
          <circle
            cx={previewPoint.x}
            cy={previewPoint.y}
            r={4}
            fill={spline.strokeColor || 'black'}
            fillOpacity={0.5}
            pointerEvents="none"
          />
        </>
      )}

      {/* ——— Actual spline strokes ——— */}
      {splinePoints.length > 0 && (
        <>  
          {/* invisible thick line for easier clicks */}
          <polyline
            points={splinePoints.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="transparent"
            strokeWidth={(spline.strokeWidth || 2) + 8}
            pointerEvents="stroke"
            onClick={handleSplineClick}
          />
          {/* visible line */}
          <polyline
            points={splinePoints.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={spline.strokeColor || 'black'}
            strokeWidth={spline.strokeWidth || 2}
            strokeOpacity={spline.opacity ?? 1}
            pointerEvents="none"
          />
        </>
      )}

      {/* ——— Edit handles for a completed spline ——— */}
      {selected && spline.complete && spline.points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4}
          fill="blue"
          fillOpacity="0.5"
          pointerEvents="all"
          style={{ cursor: 'move' }}
          onMouseDown={(e) => {
            e.stopPropagation();
            const drag = (moveEvent) => {
              const { left, top } = svgRef.current.getBoundingClientRect();
              const newX = moveEvent.clientX - left;
              const newY = moveEvent.clientY - top;
              const pts = spline.points.map((pt, idx) =>
                idx === i ? { x: newX, y: newY } : pt
              );
              updateSpline({ ...spline, points: pts });
            };
            const up = () => {
              document.removeEventListener('mousemove', drag);
              document.removeEventListener('mouseup', up);
            };
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', up);
          }}
        />
      ))}
      {selected && spline.complete && spline.points[0] && (
        <text
          x={spline.points[0].x - 10}
          y={spline.points[0].y - 10}
          pointerEvents="all"
          style={{ cursor: 'pointer', fontSize: '16px', fill: 'red', userSelect: 'none' }}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteSpline && onDeleteSpline(spline.id);
          }}
        >
          X
        </text>
      )}
    </svg>
  );
};

export default SplineDrawingBase;
