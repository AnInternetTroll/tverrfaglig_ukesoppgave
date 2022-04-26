import { Router } from "express";

import loginRoutes from "./login.js";
import registerRoutes from "./register.js";
import usersRoutes from "./users.js";
import meRoutes from "./me.js";
import discordRoutes from "./discord.js";

const router = Router();

router.use("/login", loginRoutes);
router.use("/register", registerRoutes);
router.use("/users", usersRoutes);
router.use("/me", meRoutes);
router.use("/discord", discordRoutes);

export default router;
