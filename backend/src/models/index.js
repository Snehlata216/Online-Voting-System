import sequelize from "../config/db.js";
import Candidate from "./Candidate.js";
import Party from "./Party.js";
import Election from "./Election.js";
import Vote from "./Vote.js";
import Voter from "./Voter.js";
import Result from "./Result.js";
import Feedback from "./Feedback.js";
import SecurityLog from "./SecurityLog.js";

// ✅ Define relationships
Party.hasMany(Candidate, { foreignKey: "partyId", as: "candidates" });
Candidate.belongsTo(Party, { foreignKey: "partyId", as: "party" });

Election.hasMany(Candidate, { foreignKey: "electionId", as: "candidates" });
Candidate.belongsTo(Election, { foreignKey: "electionId", as: "election" });

Voter.hasMany(Vote, { foreignKey: "voterId", as: "votes" });
Vote.belongsTo(Voter, { foreignKey: "voterId", as: "voter" });

Candidate.hasMany(Vote, { foreignKey: "candidateId", as: "votes" });
Vote.belongsTo(Candidate, { foreignKey: "candidateId", as: "candidate" });

Election.hasMany(Vote, { foreignKey: "electionId", as: "votes" });
Vote.belongsTo(Election, { foreignKey: "electionId", as: "election" });

Election.hasOne(Result, { foreignKey: "electionId", as: "result" });
Result.belongsTo(Election, { foreignKey: "electionId", as: "electionResult" });

Candidate.hasMany(Feedback, { foreignKey: "candidateId", as: "feedbacks" });
Feedback.belongsTo(Candidate, { foreignKey: "candidateId", as: "candidate" });

// ✅ Export all models
export {
  sequelize,
  Candidate,
  Party,
  Election,
  Vote,
  Voter,
  Result,
  Feedback,
  SecurityLog,
};
