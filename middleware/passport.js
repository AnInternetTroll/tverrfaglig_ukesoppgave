import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import { Strategy as LocalStrategy } from "passport-local";

import { config } from "../models/config.js";
import User from "../models/user.js";

passport.serializeUser((user, done) => done(null, user.username));

passport.deserializeUser(async (username, done) => {
	try {
		done(null, await User.find(username));
	} catch (err) {
		done(err);
	}
});

passport.use(
	new LocalStrategy(async (email, password, done) => {
		try {
			const user = await User.findByEmail(email);
			if (!user) {
				return done(null, false, {
					message: "Incorrect email or password.",
				});
			}
			if (!User.comparePassword(password, user.hash, user.salt))
				return done(null, false, {
					message: "Incorrect email or password.",
				});
			return done(null, user);
		} catch (err) {
			console.error(err);
			return done(err);
		}
	})
);

passport.use(
	new DiscordStrategy(
		{
			clientID: config.DISCORD_ID,
			clientSecret: config.DISCORD_SECRET,
			callbackURL: config.CALLBACK_URL,
			scope: ["email", "identity"],
		},
		async (_accessToken, _refreshToken, profile, cb) => {
			try {
				const user = await User.findByDiscordId(profile.id);
				if (user) {
					return cb(null, user);
				} else {
					const user = new User({
						username: profile.username,
						email: profile.email,
						discordId: profile.id,
					});
					await user.save();
					return cb(null, user);
				}
			} catch (err) {
				return cb(err);
			}
		}
	)
);

export default passport;

export function restrict(req, res, next) {
	passport.authenticate("local")(req, res, next);
}
