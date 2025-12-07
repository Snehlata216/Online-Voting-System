import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ElectionAdmin = sequelize.define("election_admin", {
  adminId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  role: DataTypes.STRING,
  password: DataTypes.STRING
}, { timestamps: true });

export default ElectionAdmin;
