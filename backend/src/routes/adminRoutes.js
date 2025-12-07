// src/routes/adminRoutes.js
import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getAllAdmins,
  deleteAdmin,
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/", getAllAdmins);
router.delete("/:adminId", deleteAdmin);

export default router;
