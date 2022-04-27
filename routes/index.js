import { Router } from "express";
import createError from "http-errors";

import loginRoutes from "./login.js";
import logoutRoutes from "./logout.js";
import registerRoutes from "./register.js";
import usersRoutes from "./users.js";
import meRoutes from "./me.js";
import discordRoutes from "./discord.js";
import referenceRoutes from "./reference.js";
import { config } from "../models/config.js";

const router = Router();

router.use("/login", loginRoutes);
router.use("/logout", logoutRoutes);
router.use("/register", registerRoutes);
router.use("/users", usersRoutes);
router.use("/me", meRoutes);
router.use("/discord", discordRoutes);
router.use("/reference", referenceRoutes);
router.get("/", (_req, res) => res.render("index"));

router.use((req, res, next) => {
	next(createError(404, "Not found"));
});

router.use((err, req, res, next) => {
	console.error(err.message);
	res.status(err.status || 500).render("error", {
		message: err.message || "Something bad happened :(",
		stack: config.NODE_ENV === "development" ? err.stack : null,
	});
});

export default router;
