import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Election from "./Election.js";

const Result = sequelize.define(
  "Result",
  {
    resultId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    electionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "elections",
        key: "electionId",
      },
    },
    generatedTimestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "results",
    timestamps: true,
  }
);

// Association
Result.belongsTo(Election, { foreignKey: "electionId", as: "election" });

export default Result;
