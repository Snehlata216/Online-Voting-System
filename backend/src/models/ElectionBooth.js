import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ElectionBooth = sequelize.define("election_booth", {
  boothId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  location: DataTypes.STRING
}, { timestamps: true });

export default ElectionBooth;
