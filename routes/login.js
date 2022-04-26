import { Router } from "express";
import { restrict } from "../middleware/passport.js";
const router = Router();

router.get("/", (_req, res) =>
	res.render("login", {
		status: null,
		discordLink: `https://discord.com/api/oauth2/authorize?client_id=${
			process.env.DISCORD_ID
		}&redirect_uri=${encodeURIComponent(
			process.env.CALLBACK_URL
		)}&response_type=code&scope=${encodeURIComponent("identify email")}`,
	})
);

router.post("/", restrict, (_req, res) => {
	// If this function gets called, authentication was successful.
	res.redirect("/me");
});

export default router;
