// src/config/db.js
const { Sequelize } = require("sequelize");
// Create a new Sequelize instance (MySQL example)
const sequelize = new Sequelize("online_voting_system", "root", "root", {
  host: "localhost",
  dialect: "mysql",
  logging: false, // disable SQL logs
});

// Test the connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Connected Successfully!");
  } catch (error) {
    console.error("❌ Unable to connect to MySQL:", error);
  }
})();

module.exports = sequelize;
