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
		// If there is already a password
		// Then there will not be a hash
		if (password) this.password = password;
		else this.hash = hash;
	}

	/**
	 *
	 * @param {BinaryLike} password The password to be hashed
	 * @param {BinaryLike} salt The salt which will be used to hash
	 * @returns {Buffer} Hashed password as a buffer
	 */
	static hashPassword(password, salt) {
		return pbkdf2Sync(password, salt, 1000, 32, "sha256");
	}

	/**
	 * Save the user instance to a database
	 * This will save to the users_discord or users_local table accordingly
	 * And salt/hash the password
	 */
	async save() {
		if (!this.hash || !this.discordId) {
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

	/**
	 *
	 * @param {string} username Username/primary key
	 * @returns {Promise<User>}
	 */
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

	/**
	 * Get a user from users_local
	 * @param {string} username Username/Primary key
	 * @returns {Promise<{username: string; hash: Buffer; salt: Buffer;}>} The user from users_local
	 */
	static #findLocalUser(username) {
		return db.get("SELECT * FROM users_local WHERE username = ?", username);
	}

	/**
	 * Get a user from uesrs
	 * @param {string} username Username/Primary key
	 * @returns {Promise<{username: string; email: string;}>}
	 */
	static #findUser(username) {
		return db.get("SELECT * FROM users WHERE username = ?", username);
	}

	/**
	 * Get a user from users_discord
	 * @param {string} username Username/Primary key
	 * @returns {Promise<{username: string; discordId: string;}>}
	 */
	static #findDiscordUser(username) {
		return db.get("SELECT * FROM users_discord WHERE username = ?", username);
	}

	/**
	 *
	 * @param {string} discordId A discord ID
	 * @returns {Promise<{username: string; discordId: string;}>}
	 */
	static #findDiscordUserById(discordId) {
		return db.get(
			"SELECT * FROM users_discord WHERE discord_id = ?",
			discordId
		);
	}

	/**
	 * Get a user by email
	 * @param {string} email Email
	 * @returns {Promise<User>}
	 */
	static async findByEmail(email) {
		const user = await db.get("SELECT * FROM users WHERE email = ?", email);
		return User.find(user.username);
	}

	/**
	 * Find a user by discord ID
	 * @param {string} id Discord ID
	 * @returns {Promise<User>}
	 */
	static async findByDiscordId(id) {
		const discordUser = await User.#findDiscordUserById(id);
		if (!discordUser) return null;
		const user = await User.#findUser(discordUser.username);

		return User.find(user.username);
	}

	/**
	 * Get all users
	 * @returns {Promise<User[]>}
	 */
	static async all() {
		const users = await db.all("SELECT username FROM users");
		return Promise.all(users.map((user) => User.find(user.username)));
	}

	/**
	 * Compare passwords
	 * @param {string} unhashedPassword The unhashed password to be compared
	 * @param {BinaryLike} hashedPassword A hashed password
	 * @param {BinaryLike} salt The same salt the hashedPassword was generated with
	 * @returns {boolean}
	 */
	static comparePassword(unhashedPassword, hashedPassword, salt) {
		const hash = User.hashPassword(unhashedPassword, salt);

		return timingSafeEqual(hash, hashedPassword);
	}
}
