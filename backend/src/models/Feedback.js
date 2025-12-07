import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Candidate from "./Candidate.js";

const Feedback = sequelize.define(
  "Feedback",
  {
    feedbackId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    voterId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    candidateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "feedbacks",
    timestamps: true,
  }
);

// Associations
// Candidate.hasMany(Feedback, { foreignKey: "candidateId", as: "feedbacks" });
// Feedback.belongsTo(Candidate, { foreignKey: "candidateId", as: "candidate" });

export default Feedback;
