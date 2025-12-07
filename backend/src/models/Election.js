import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Election = sequelize.define("Election", {
  electionId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  startDate: {
    type: DataTypes.DATE,   // ✅ use DATE if you want date+time
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,   // ✅ use DATE if you want date+time
    allowNull: false,
  },
  electionType: {
    type: DataTypes.STRING(50), // ✅ easier to store type names directly
    allowNull: true,
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    // ✅ optionally add association later: Election.belongsTo(Admin)
  },
  status: {
    type: DataTypes.ENUM("upcoming", "ongoing", "completed"),
    defaultValue: "upcoming",
  },
}, {
  timestamps: true, // adds createdAt, updatedAt automatically
});

export default Election;
