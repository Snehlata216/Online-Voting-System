// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { listVoters } from "../api/voters";
import { listCandidates } from "../api/candidates";
import { listAdmins } from "../api/admins";
import { listElections } from "../api/elections";
import { Link } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    voters: 0,
    candidates: 0,
    admins: 0,
    elections: 0,
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setStatus("Loading stats...");
    try {
      const [vRes, cRes, aRes, eRes] = await Promise.all([
        listVoters(),
        listCandidates(),
        listAdmins(),
        listElections(),
      ]);
      setStats({
        voters: vRes.data?.length || 0,
        candidates: cRes.data?.length || 0,
        admins: aRes.data?.length || 0,
        elections: eRes.data?.length || 0,
      });
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Failed to load stats");
    }
  };

  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
      {status && <p>{status}</p>}
      <div className="dashboard-grid">
        <Link to="/voters" className="dashboard-card">
          <h2>Voters</h2>
          <p>{stats.voters}</p>
        </Link>
        <Link to="/candidates" className="dashboard-card">
          <h2>Candidates</h2>
          <p>{stats.candidates}</p>
        </Link>
        <Link to="/elections" className="dashboard-card">
          <h2>Elections</h2>
          <p>{stats.elections}</p>
        </Link>
        <Link to="/admins" className="dashboard-card">
          <h2>Admins</h2>
          <p>{stats.admins}</p>
        </Link>
      </div>
    </div>
  );
}
