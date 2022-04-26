import express from "express";
import session from "express-session";
import SQLiteStore from "connect-sqlite3";
import { randomBytes } from "crypto";

import { config } from "./models/config.js";
import routes from "./routes/index.js";
import passport from "./middleware/passport.js";
import User from "./models/user.js";

const app = express();
const SQLiteStoreSession = SQLiteStore(session);

app.use(express.static("public"));
app.use(
	session({
		secret: randomBytes(16).toString("utf-8"),
		resave: false,
		saveUninitialized: false,
		store: new SQLiteStoreSession({
			table: "sessions",
			db: config.SQLITE,
		}),
	})
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
	res.locals.user = req.user;
	next();
});

app.set("view engine", "pug");

app.use(express.static("public"));

app.use(routes);

app.get(
	"/discord",
	passport.authenticate("discord", {
		failureRedirect: "/login",
		successRedirect: "/me"
	}),
	(_req, res) => {
		res.redirect("/login"); // Successful auth
	}
);

app.get("/logout", (req, res) => {
	req.logOut();
	// Redirect the user to where they came from
	res.redirect(req.headers.referer || "/login");
});

app.get("/users", async (_req, res) => {
	res.render("users", {
		users: await User.all(),
	});
});

app.get("/me", async (req, res) => {
	if (req.isAuthenticated()) res.render("me", { user: req.user });
	else res.render("error", { message: "Not authenticated" });
});

app.listen(process.env.PORT, () =>
	console.log(`listening on port http://localhost:${process.env.PORT}/login`)
);
