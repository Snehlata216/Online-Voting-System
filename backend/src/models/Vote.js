// src/models/Vote.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Vote = sequelize.define("Vote", {
  voteId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  voterId: { type: DataTypes.STRING(50), allowNull: false },
  candidateId: { type: DataTypes.INTEGER, allowNull: true },
  electionId: { type: DataTypes.INTEGER, allowNull: true },
  voteTime: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.ENUM("valid", "invalid"), defaultValue: "valid" },
}, {
  tableName: "votes",
  timestamps: true,
});



export default Vote;
