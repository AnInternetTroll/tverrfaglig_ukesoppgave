import { Router } from "express";

import loginRoutes from "./login.js";
import logoutRoutes from "./logout.js";
import registerRoutes from "./register.js";
import usersRoutes from "./users.js";
import meRoutes from "./me.js";
import discordRoutes from "./discord.js";
import referenceRoutes from "./reference.js";

const router = Router();

router.use("/login", loginRoutes);
router.use("/logout", logoutRoutes);
router.use("/register", registerRoutes);
router.use("/users", usersRoutes);
router.use("/me", meRoutes);
router.use("/discord", discordRoutes);
router.use("/reference", referenceRoutes);
router.use("/", (_req, res) => res.render("index"));

export default router;
