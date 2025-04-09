import React, { useState, useEffect } from 'react';

const SplineAnnotation = ({ annotation, updateAnnotation }) => {
  const [selected, setSelected] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState(annotation.points || []);

  // Initialize with at least one point if points array is empty
  useEffect(() => {
    if (!annotation.points || annotation.points.length === 0) {
      // Initialize with a point in the middle of the annotation box
      const initialPoint = { x: annotation.width / 2, y: annotation.height / 2 };
      updateAnnotation({ 
        ...annotation, 
        points: [initialPoint],
        complete: false 
      });
    }
  }, []);

  // A simple smoothing (moving average) algorithm
  const smoothLine = (points) => {
    if (points.length < 3) return points;
    const smoothed = [points[0]];
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      const avgX = (prev.x + curr.x + next.x) / 3;
      const avgY = (prev.y + curr.y + next.y) / 3;
      smoothed.push({ x: avgX, y: avgY });
    }
    smoothed.push(points[points.length - 1]);
    return smoothed;
  };

  // Handle point dragging - coordinates are relative to the SVG
  const handlePointDrag = (index, newX, newY) => {
    // Ensure coordinates stay within bounds
    const boundedX = Math.max(0, Math.min(newX, annotation.width));
    const boundedY = Math.max(0, Math.min(newY, annotation.height));
    
    const newPoints = annotation.points.map((p, i) =>
      i === index ? { x: boundedX, y: boundedY } : p
    );
    updateAnnotation({ ...annotation, points: newPoints });
  };

  // Drawing handlers - all coordinates are relative to the annotation box
  const handleMouseDown = (e) => {
    if (annotation.complete) return;
    e.stopPropagation();
    
    // Get coordinates relative to the SVG
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
    
    // Get coordinates relative to the SVG
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    
    // Only add points if they're within the bounds
    if (x >= 0 && x <= annotation.width && y >= 0 && y <= annotation.height) {
      setDrawingPoints((prevPoints) => {
        const newPoints = [...prevPoints, { x, y }];
        updateAnnotation({ ...annotation, points: newPoints, complete: false });
        return newPoints;
      });
    }
  };

  const handleMouseUp = (e) => {
    if (!isDrawing) return;
    e.stopPropagation();
    setIsDrawing(false);
    
    // Don't finalize if we don't have enough points for a line
    if (drawingPoints.length < 2) {
      updateAnnotation({ ...annotation, points: [], complete: false });
      setDrawingPoints([]);
      return;
    }
    
    // Smooth the drawn points
    const smoothed = smoothLine(drawingPoints);
    updateAnnotation({ ...annotation, points: smoothed, complete: true });
    setDrawingPoints([]);
  };

  // Define event handlers based on annotation state
  const drawingHandlers = annotation.complete
    ? { onClick: (e) => { e.stopPropagation(); setSelected(!selected); } }
    : {
        onMouseDown: handleMouseDown,
        onMouseMove: handleMouseMove,
        onMouseUp: handleMouseUp,
        onMouseLeave: handleMouseUp, // Ensure stroke ends if pointer leaves
      };

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
      {annotation.points && annotation.points.length > 0 && (
        <polyline
          points={annotation.points
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
            style={{ cursor: 'move' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              const startDrag = (moveEvent) => {
                const svgRect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
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
        ))}
      
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