import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
	req.logOut();
	// Redirect the user to where they came from
	res.redirect(req.headers.referer || "/login");
});

export default router;
