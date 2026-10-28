import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import contactRoutes from "../modules/contact/contact.routes.js";
import contentRoutes from "../modules/content/content.routes.js";
import adminContentRoutes from "../modules/content/admin-content.routes.js";
import mediaRoutes from "../modules/media/media.routes.js";
import subscriberRoutes from "../modules/subscribers/subscribers.routes.js";
import statsRoutes from "../modules/stats/stats.routes.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/contact", contactRoutes);
router.use("/content", contentRoutes);
router.use("/subscribers", subscriberRoutes);

router.use("/admin", requireAuth);
router.use("/admin", adminContentRoutes);
router.use("/admin/media", mediaRoutes);
router.use("/admin/stats", statsRoutes);

export default router;
