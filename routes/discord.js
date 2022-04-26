import { Router } from "express";
import passport from "../middleware/passport.js";

const router = Router();

router.get(
	"/",
	passport.authenticate("discord", {
		failureRedirect: "/login",
		successRedirect: "/me",
	}),
);

export default router;
