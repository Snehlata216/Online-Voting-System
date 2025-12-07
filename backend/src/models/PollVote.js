import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const PollVote = sequelize.define("PollVote", {
  voteId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  pollId: { type: DataTypes.INTEGER, allowNull: false },
  voterId: { type: DataTypes.STRING(50), allowNull: false },
  choice: { type: DataTypes.STRING(100), allowNull: false },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: "poll_vote",
  timestamps: false,
});


export default PollVote;
