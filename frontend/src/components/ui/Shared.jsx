import React from "react";
import { Plus } from "lucide-react";

export function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export function Form({ children, onSubmit }) {
  return (
    <form className="form" onSubmit={onSubmit}>
      {children}
      <button><Plus size={16} /> Save</button>
    </form>
  );
}

export function Table({ rows, fields }) {
  if (!rows.length) return <p className="muted">No records found.</p>;
  return (
    <div className="table">
      <div className="row head">
        {fields.map((field) => <span key={field}>{field}</span>)}
      </div>
      {rows.map((row, i) => (
        <div className="row" key={i}>
          {fields.map((field) => <span key={field}>{row[field] || "-"}</span>)}
        </div>
      ))}
    </div>
  );
}