import { Router } from "express";
import loginRoutes from "./login.js";
import registerRoutes from "./register.js";

const router = Router();

router.use("/login", loginRoutes);
router.use("/register", registerRoutes);

export default router;
