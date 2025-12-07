import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ElectionType = sequelize.define("election_type", {
  typeId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  typeName: DataTypes.STRING,
  description: DataTypes.TEXT
}, { timestamps: false });

export default ElectionType;
