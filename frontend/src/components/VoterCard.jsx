import React from "react";
import { Link } from "react-router-dom";

export default function VoterCard({ voter, onDelete }) {
  return (
    <div className="voter-card">
      <h3 className="voter-name">{voter.name}</h3>
      <p className="voter-meta"><strong>ID:</strong> {voter.voterId}</p>
      <p className="voter-meta"><strong>Email:</strong> {voter.email}</p>
      <p className="voter-meta"><strong>Age:</strong> {voter.age}</p>
      <p className="voter-meta"><strong>Eligibility:</strong> {String(voter.eligibilityStatus)}</p>
      <div className="voter-card-actions">
        <Link className="button" to={`/voters/${voter.voterId}/edit`}>Edit</Link>
        <button className="button" onClick={() => onDelete(voter.voterId)}>Delete</button>
      </div>
    </div>
  );
}
