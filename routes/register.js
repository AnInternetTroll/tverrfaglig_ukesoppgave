import { Router } from "express";
import User from "../models/user.js";
import rateLimit from "express-rate-limit";

const router = Router();

router.get("/", (_req, res) => res.render("register", { status: null }));

router.post(
	"/",
	rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
		standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	}),
	async (req, res) => {
		const user = new User({
			username: req.body.username,
			password: req.body.password,
			email: req.body.email,
		});

		try {
			await user.save();
			req.logIn(
				{
					username: user.username,
				},
				(err) => {
					if (err) {
						console.error(err);
						return res.render("error", { message: err.message });
					}
					res.redirect("/me");
				}
			);
			//
		} catch (err) {
			console.error(err);
			res.render("error", { message: err.message });
		}
	}
);

export default router;
