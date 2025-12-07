// src/models/Voter.js

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Voter = sequelize.define(
  "Voter",
  {
    voterId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: "unique_email",  // ✅ FIX: prevents duplicate unique keys
      validate: {
        isEmail: true,
      },
    },

    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    citizenship: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    residency: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    eligibilityStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "voters",
    timestamps: true,
  }
);

export default Voter;
