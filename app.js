import express from "express";
import session from "express-session";
import SQLiteStore from "connect-sqlite3";
import { randomBytes } from "crypto";
import rateLimit from "express-rate-limit";

import { config } from "./models/config.js";
import routes from "./routes/index.js";
import passport from "./middleware/passport.js";

const app = express();
const SQLiteStoreSession = SQLiteStore(session);

app.use(
	rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
		standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	})
);
app.use(express.static("public"));
app.use(
	session({
		// Use a pre-defined secret
		// Or generate a new one if it doesn't exist
		// Ideally a pre-made secret should be defined
		// To keep users logged in in case of a server restart
		secret: config.SECRET || randomBytes(16).toString("utf-8"),
		resave: false,
		saveUninitialized: false,
		// Save the sessions to a persistent database
		// here we use the same SQLite database as for the users
		store: new SQLiteStoreSession({
			table: "sessions",
			db: config.SQLITE,
		}),
	})
);
// Decode URI encoded bodies
// Such as input coming from requests
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(passport.session());

// Change this in case of migration to some other view engine
// Such as EJS or Handlebreak
app.set("view engine", "pug");
app.use(express.static("public"));

// Send the user as a global variable
// To the view engine
// Used for the navbar for example
app.use((req, res, next) => {
	res.locals.user = req.user;
	next();
});
app.use(routes);
app.use((err, _req, res, _next) => {
	console.error(err);
	res.status(500).render("error", {
		message: err.message || "Something bad happened :(",
	});
});

const server = app.listen(process.env.PORT || 3000, () =>
	console.log(`Listening on port http://localhost:${process.env.PORT}/login`)
);

process.on("SIGTERM", () => {
	console.debug("SIGTERM signal received: closing HTTP server");
	server.close(() => {
		console.debug("HTTP server closed");
	});
});
