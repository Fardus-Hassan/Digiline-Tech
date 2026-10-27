import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import contactRoutes from "../modules/contact/contact.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/contact", contactRoutes);

export default router;
