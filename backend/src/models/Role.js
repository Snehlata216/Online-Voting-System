import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Role = sequelize.define("role", {
  roleId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  roleName: DataTypes.STRING,
  description: DataTypes.TEXT
}, { timestamps: false });

export default Role;
