import { Router } from "express";
import User from "../models/user.js";

const router = Router();

router.get("/", async (_req, res) =>
	res.render("users", {
		users: await User.all(),
	})
);

export default router;
