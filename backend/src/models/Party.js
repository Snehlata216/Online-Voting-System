import pkg from "../config/db.js";
const sequelize = pkg;
import { DataTypes } from "sequelize";

const Party = sequelize.define("Party", {
  partyId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  partyName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  symbol: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  leader: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  foundedYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
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
}, {
  tableName: "parties",
  timestamps: true,
});

export default Party;
