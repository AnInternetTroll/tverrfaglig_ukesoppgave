import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
	if (req.isAuthenticated()) res.render("me", { user: req.user });
	else res.render("error", { message: "Not authenticated" });
});

export default router;
