import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
	res.render("reference");
});

export default router;
