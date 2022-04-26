import { Router } from "express";
import { restrict } from "../middleware/passport.js";
import rateLimit from "express-rate-limit";

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

router.post(
	"/",
	rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
		standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	}),
	restrict,
	(_req, res) => {
		// If this function gets called, authentication was successful.
		res.redirect("/me");
	}
);

export default router;
