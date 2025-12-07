import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Candidate = sequelize.define("Candidate", {
  candidateId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  electionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  partyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  manifesto: {
    type: DataTypes.TEXT,
  },
  totalVotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default Candidate;
