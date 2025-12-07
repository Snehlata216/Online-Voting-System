// src/pages/Admins.jsx
// List all admins and allow deletion. Backend supports GET /admins and DELETE /admins/:adminId.

import React, { useEffect, useState } from "react";
import { listAdmins, deleteAdmin } from "../api/admins";
import { Link } from "react-router-dom";
import "./Admins.css";

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    load();
  }, []);

  // Load all admins
  const load = async () => {
    setStatus("Loading admins...");
    try {
      const res = await listAdmins();
      setAdmins(res.data || []);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Failed to load admins");
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this admin?")) return;
    try {
      await deleteAdmin(id);
      setAdmins((s) => s.filter((a) => a.adminId !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Admins</h1>
        <Link className="button" to="/admins/new">
          New Admin
        </Link>
      </div>
      {status && <p>{status}</p>}
      <div className="card-grid">
        {admins.map((a) => (
          <div className="admin-card" key={a.adminId}>
            <h3 className="admin-name">{a.name}</h3>
            <p className="admin-meta">
              <strong>ID:</strong> {a.adminId}
            </p>
            <p className="admin-meta">
              <strong>Email:</strong> {a.email}
            </p>
            <div className="admin-actions">
              {/* Edit removed because backend has no update route */}
              <button
                className="button danger"
                onClick={() => handleDelete(a.adminId)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
