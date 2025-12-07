import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { sequelize } from "./models/index.js"; // Sequelize instance

// ⭐ Import Routes
import voterRoutes from "./routes/voterRoutes.js";
import electionRoutes from "./routes/electionRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import partyRoutes from "./routes/partyRoutes.js";
import voteRoutes from "./routes/voteRoutes.js";       // contains /elections/:id/votes and /polls/:id/votes
import adminRoutes from "./routes/adminRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import pollRoutes from "./routes/pollRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

dotenv.config();

const app = express();

// ⭐ Middlewares
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// ⭐ API Routes
app.use("/api/voters", voterRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/parties", partyRoutes);

// ✅ Mount voteRoutes directly under /api
// This ensures /api/elections/:id/votes and /api/polls/:id/votes work
app.use("/api", voteRoutes);

app.use("/api/admins", adminRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);

// ⭐ Root Route
app.get("/", (req, res) => {
  res.send("🗳️ Online Voting System Backend is Running!");
});

// ⭐ Start Server
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database Connected!");

    // ⚠️ SAFE sync (do not drop tables)
    await sequelize.sync({ alter: false });
    console.log("📦 Models Synced Successfully!");

    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
})();

// ⭐ Graceful Shutdown
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down...");
  await sequelize.close();
  console.log("💾 Database connection closed.");
  process.exit(0);
});
