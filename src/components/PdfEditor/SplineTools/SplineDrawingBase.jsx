import React, { useState, useRef, useEffect } from 'react';

const SplineDrawingBase = ({
  spline,                // renamed from "annotation"; does not require x, y, width, height
  updateSpline,
  drawingHandlers,       // handlers passed from tool (if needed)
  extraToolbarElements,  // any extra controls to display on the editor’s toolbar area
  onSelectSpline         // callback to inform parent when this spline is selected
}) => {
  const [selected, setSelected] = useState(false);
  const svgRef = useRef(null);

  // Listen for clicks outside to deselect, if needed.
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

  // Catmull-Rom interpolation function.
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

  const splinePoints =
    spline.complete && spline.points && spline.points.length > 0
      ? interpolate(spline.points)
      : spline.points;

  // When the spline is clicked, mark it as selected and notify parent.
  const handleSplineClick = (e) => {
    e.stopPropagation();
    setSelected(true);
    if (onSelectSpline) {
      onSelectSpline(spline.id);
    }
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
        zIndex: 9999,
        pointerEvents: 'auto',
        cursor: drawingHandlers?.cursor || 'default'
      }}
      onClick={handleSplineClick}
      {...drawingHandlers}
    >
      {/* Add a transparent rectangle to capture all pointer events */}
      <rect width="100%" height="100%" fill="transparent" />
      
      {splinePoints && splinePoints.length > 0 && (
        <polyline
          points={splinePoints.map(p => `${p.x},${p.y}`).join(' ')}
          stroke={spline.strokeColor || 'black'}
          strokeWidth={spline.strokeWidth || 2}
          strokeOpacity={spline.opacity ?? 1}
          fill="none"
        />
      )}
  
      {selected && spline.complete && spline.points &&
        spline.points.map((p, i) => (
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
                const newPoints = spline.points.map((pt, idx) =>
                  idx === i ? { x: newX, y: newY } : pt
                );
                updateSpline({ ...spline, points: newPoints });
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
  );
};  

export default SplineDrawingBase;
