import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Ballot = sequelize.define("ballot", {
  ballotId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  status: DataTypes.STRING,
  generatedTimestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { timestamps: false });

export default Ballot;
