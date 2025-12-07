import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const SecurityLog = sequelize.define(
  "SecurityLog",
  {
    logId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "securitylogs", // ✅ lowercase for MySQL
    timestamps: true,
  }
);

export default SecurityLog;
