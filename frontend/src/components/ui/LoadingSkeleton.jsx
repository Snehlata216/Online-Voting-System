// src/components/ui/LoadingSkeleton.jsx
import React from "react";
import "./loadingSkeleton.css";

export default function LoadingSkeleton({ rows = 4, columns = 1, height = 16, className = "" }) {
  const cols = Array.from({ length: columns });
  const rowsArr = Array.from({ length: rows });

  return (
    <div className={`skeleton-root ${className}`} role="status" aria-live="polite" aria-label="Loading">
      {rowsArr.map((_, rIdx) => (
        <div className="skeleton-row" key={rIdx}>
          {cols.map((_, cIdx) => (
            <div
              key={cIdx}
              className="skeleton-block"
              style={{ height: typeof height === "number" ? `${height}px` : height }}
            />
          ))}
        </div>
      ))}
      <span className="sr-only">Loading content</span>
    </div>
  );
}
