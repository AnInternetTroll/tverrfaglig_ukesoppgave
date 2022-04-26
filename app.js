import express from "express";
import session from "express-session";
import SQLiteStore from "connect-sqlite3";
import { randomBytes } from "crypto";

import { config } from "./models/config.js";
import routes from "./routes/index.js";
import passport from "./middleware/passport.js";

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

app.set("view engine", "pug");
app.use(express.static("public"));

app.use((req, res, next) => {
	res.locals.user = req.user;
	next();
});
app.use(routes);

app.listen(process.env.PORT, () =>
	console.log(`listening on port http://localhost:${process.env.PORT}/login`)
);
