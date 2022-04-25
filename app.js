import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import session from "express-session";
import SQLiteStore from "connect-sqlite3";
import { pbkdf2, randomBytes, timingSafeEqual } from "crypto";
import { Strategy as DiscordStrategy } from "passport-discord";
import { config } from "dotenv";

config();

function restrict(req, res, next) {
	passport.authenticate("local")(req, res, next);
}

/**
CREATE TABLE "users_local" (
	"username"	TEXT NOT NULL UNIQUE,
	"hash"	TEXT NOT NULL,
	"salt"	TEXT NOT NULL,
	PRIMARY KEY("username")
);
CREATE TABLE "users" (
	"username"	TEXT NOT NULL UNIQUE,
	"email"	TEXT,
	PRIMARY KEY("username")
);
CREATE TABLE "users_discord" (
	"username"	TEXT NOT NULL UNIQUE,
	"discord_id"	TEXT NOT NULL UNIQUE,
	PRIMARY KEY("username")
);
 */
const db = await open({
	filename: process.env.SQLITE,
	driver: sqlite3.Database,
});

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
			db: process.env.SQLITE,
		}),
	})
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

passport.serializeUser((user, done) => done(null, user.username));

passport.deserializeUser(async (username, done) => {
	try {
		done(
			null,
			await db.get("SELECT * FROM users WHERE username = ?", username)
		);
	} catch (err) {
		done(err);
	}
});

passport.use(
	new LocalStrategy(async (username, password, done) => {
		try {
			console.log(username, password);
			const user = await db.get(
				"SELECT username, hash, salt FROM users_local WHERE username = ?",
				username
			);
			if (!user) {
				return done(null, false, { message: "Incorrect username." });
			}
			pbkdf2(password, user.salt, 1000, 32, "sha256", async (err, key) => {
				if (err) return done(err);
				if (!timingSafeEqual(key, user.hash)) {
					return done(null, false, {
						message: "Incorrect username or password.",
					});
				}
				return done(
					null,
					await db.get("SELECT * FROM users WHERE username = ?", user.username)
				);
			});
		} catch (err) {
			if (err) {
				return done(err);
			}
		}
	})
);

passport.use(
	new DiscordStrategy(
		{
			clientID: process.env.DISCORD_ID,
			clientSecret: process.env.DISCORD_SECRET,
			callbackURL: process.env.CALLBACK_URL,
			scope: ["email", "identity"],
		},
		async (accessToken, refreshToken, profile, cb) => {
			try {
				const discordUser = await db.get(
					"SELECT username FROM users_discord WHERE discord_id = ?",
					profile.id
				);
				if (discordUser) {
					return cb(
						null,
						await db.get(
							"SELECT * FROM users WHERE username = ?",
							discordUser.username
						)
					);
				} else {
					try {
						db.run(
							"INSERT INTO users_discord (username, discord_id) VALUES (?, ?)",
							profile.username,
							profile.id
						);
						db.run(
							"INSERT INTO users (username, email) VALUES (?, ?)",
							profile.username,
							profile.email
						);
						return cb(
							null,
							db.get(
								"SELECT username FROM users WHERE username = ?",
								profile.username
							)
						);
					} catch (err) {
						return cb(err);
					}
				}
			} catch (err) {
				cb(err);
			}
		}
	)
);

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "pug");

app.use(express.static("public"));
app.get("/login", (req, res) =>
	res.render("login", {
		status: null,
		discordLink: `https://discord.com/api/oauth2/authorize?client_id=${
			process.env.DISCORD_ID
		}&redirect_uri=${encodeURIComponent(
			process.env.CALLBACK_URL
		)}&response_type=code&scope=${encodeURIComponent("identify email")}`,
	})
);

app.post("/login", restrict, (req, res) => {
	// If this function gets called, authentication was successful.
	// "req.user" contains the authenticated user.
	res.render("login", {
		status: "Welcome, ${req.user.username}",
		discordLink: `https://discord.com/api/oauth2/authorize?client_id=${
			process.env.DISCORD_ID
		}&redirect_uri=${encodeURIComponent(
			process.env.CALLBACK_URL
		)}&response_type=code&scope=${encodeURIComponent("identify email")}`,
	});
});

app.get("/discord_login", passport.authenticate("discord"));
app.get(
	"/discord",
	passport.authenticate("discord", {
		failureRedirect: "/login",
	}),
	(req, res) => {
		res.redirect("/login"); // Successful auth
	}
);

app.get("/register", (req, res) => res.render("register", { status: null }));
app.post("/register", (req, res) => {
	const salt = randomBytes(16);
	pbkdf2(req.body.password, salt, 1000, 32, "sha256", async (err, key) => {
		try {
			await db.run(
				"INSERT INTO users_local (username, hash, salt) VALUES (?, ?, ?)",
				req.body.username,
				key,
				salt
			);
			await db.run(
				"INSERT INTO users (username, email) VALUES (?, ?)",
				req.body.username,
				req.body.email
			);
			req.logIn({
				username: req.body.username,
			});
			res.redirect("/login");
		} catch (err) {
			res.send(err);
		}
	});
});

app.get("/users", async (req, res) => {
	res.render("users", {
		users: await db.all("SELECT * FROM users"),
	});
});

app.get("/me", async (req, res) => {
	if (req.isAuthenticated()) res.render("me", { user: req.user });
	else res.render("error", { message: "Not authenticated" });
});

app.listen(process.env.PORT, () =>
	console.log(`listening on port http://localhost:${process.env.PORT}/login`)
);
