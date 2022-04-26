import { config as configDotenv } from "dotenv";

configDotenv();

export default class Config {
	PORT;
	DISCORD_ID;
	DISCORD_SECRET;
	CALLBACK_URL;
	SQLITE;

	constructor() {
		this.PORT = process.env.PORT;
		this.DISCORD_ID = process.env.DISCORD_ID;
		this.DISCORD_SECRET = process.env.DISCORD_SECRET;
		this.CALLBACK_URL = process.env.CALLBACK_URL;
		this.SQLITE = process.env.SQLITE;
	}
}

export const config = new Config();
