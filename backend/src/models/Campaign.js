import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Campaign = sequelize.define("campaign", {
  campaignId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  campaignDetails: DataTypes.TEXT
}, { timestamps: true });

export default Campaign;
