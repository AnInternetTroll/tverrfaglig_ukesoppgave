import { config as configDotenv } from "dotenv";

// `dotenv` reads from .env file in the root directory of the project
// This function will read the file and set `process.env.NAME` to the value set in the .env file
configDotenv();

export default class Config {
	PORT;
	DISCORD_ID;
	DISCORD_SECRET;
	CALLBACK_URL;
	SQLITE;
	SECRET;
	NODE_ENV;

	constructor() {
		this.PORT = process.env.PORT;
		this.DISCORD_ID = process.env.DISCORD_ID;
		this.DISCORD_SECRET = process.env.DISCORD_SECRET;
		this.CALLBACK_URL = process.env.CALLBACK_URL;
		this.SQLITE = process.env.SQLITE;
		this.SECRET = process.env.SECRET;
		this.NODE_ENV = process.env.NODE_ENV;
	}
}

export const config = new Config();
