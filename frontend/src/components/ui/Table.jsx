// src/components/ui/Table.jsx
import React from "react";
import "./table.css";

/**
 * props:
 * - columns: [{ key, label, width?, render?(row) }]
 * - data: array of row objects
 * - rowKey: string key name for unique key (default "id")
 * - actions?: React node or function(row) => node
 */
export default function Table({ columns = [], data = [], rowKey = "id", actions = null }) {
  if (!Array.isArray(data)) return null;

  return (
    <div className="table-responsive">
      <table className="ui-table" role="table" aria-label="Report table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                {col.label}
              </th>
            ))}
            {actions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr className="empty-row">
              <td colSpan={columns.length + (actions ? 1 : 0)} className="empty-cell">No records found</td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row[rowKey] ?? JSON.stringify(row)}>
                {columns.map((col) => (
                  <td key={col.key} data-label={col.label}>
                    {typeof col.render === "function" ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {actions && <td data-label="Actions">{typeof actions === "function" ? actions(row) : actions}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
