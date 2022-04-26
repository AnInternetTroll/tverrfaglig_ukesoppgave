import { db } from "./database.js";
import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

export default class User {
	username;
	email;
	hash;
	salt;
	discordId;

	constructor({ username, email, password, discordId, salt, hash }) {
		this.username = username;
		this.email = email;
		this.discordId = discordId;
		this.salt = salt;
		if (password) this.password = password;
		else this.hash = hash;
	}

	static hashPassword(password, salt) {
		return pbkdf2Sync(password, salt, 1000, 32, "sha256");
	}

	async save() {
		if (!this.hash) {
			this.salt = randomBytes(16);
			this.hash = User.hashPassword(this.password, this.salt);
		}
		if (!this.discordId) {
			await db.run(
				"INSERT INTO users_local (username, hash, salt) VALUES (?, ?, ?)",
				this.username,
				this.hash,
				this.salt
			);
			await db.run(
				"INSERT INTO users (username, email) VALUES (?, ?)",
				this.username,
				this.email
			);
		} else {
			await db.run(
				"INSERT INTO users_discord (username, discord_id) VALUES (?, ?)",
				this.username,
				this.discordId
			);
			await db.run(
				"INSERT INTO users (username, email) VALUES (?, ?)",
				this.username,
				this.email
			);
		}
	}

	static async find(username) {
		const user = await User.#findUser(username);
		if (!user) return null;
		const localUser = await User.#findLocalUser(username);
		const discordUser = await User.#findDiscordUser(username);

		return new User({
			username: user.username,
			email: user.email,
			discordId: discordUser?.id,
			hash: localUser?.hash,
			salt: localUser?.salt,
		});
	}

	static #findLocalUser(username) {
		return db.get("SELECT * FROM users_local WHERE username = ?", username);
	}

	static #findUser(username) {
		return db.get("SELECT * FROM users WHERE username = ?", username);
	}

	static #findDiscordUser(username) {
		return db.get("SELECT * FROM users_discord WHERE username = ?", username);
	}

	static #findDiscordUserById(discordId) {
		return db.get("SELECT * FROM users_discord WHERE discord_id = ?", discordId);
	}

	static async findByEmail(email) {
		const user = await db.get("SELECT * FROM users WHERE email = ?", email);
		return User.find(user.username);
	}

	static async findByDiscordId(id) {
		const discordUser = await User.#findDiscordUserById(id);
		if (!discordUser) return null;
		const user = await User.#findUser(discordUser.username);

		return User.find(user.username);
	}

	static all() {
		return db.all("SELECT * FROM users");
	}

	static comparePassword(unhashedPassword, hashedPassword, salt) {
		const hash = User.hashPassword(unhashedPassword, salt);

		return timingSafeEqual(hash, hashedPassword);
	}
}
