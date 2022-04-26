import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { config } from "./config.js";

/*
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
export const db = await open({
	filename: config.SQLITE,
	driver: sqlite3.Database,
});
