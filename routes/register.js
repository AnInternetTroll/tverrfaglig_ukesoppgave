import { Router } from "express";
import User from "../models/user.js";

const router = Router();

router.get("/", (_req, res) => res.render("register", { status: null }));

router.post("/", async (req, res) => {
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
});

export default router;
