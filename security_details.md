# Security

Here at [COMPANY NAME HERE] we take security very seriously.
One such aspect is how we save user data.

## Users

Users are the backbone of our platform, and as such we need to keep their passwords safe.
To do so we have implemented a system of hashing and salting passwords.

## Setup

To achieve this level of security we have 4 main frameworks that do the job.

### Express

Express is an HTTP wrapper around node's built in http library.
It will help us send data and websites to and from the browser.
It also supports something called "middlewares", which will help us authenticate a user before they are allowed on a website.

### Passport.js

Passport.js is a middleware library for express.
It will save a cookie in the user's browser, then whenever the user wants to check out a restricted route passport.js will check the cookie for the correct user and if they have permission.

### bcrypt

Bcrypt is a library for hasing passwords.
It is used to safely save passwords.
To find out if a user wrote the same password we take their input, mush it in the same way that we mushed the previous password, and see if the result is the same.
If something happens where an attacker finds the hashed password it will be very difficult for them to find out the original password.
All they can do is try and try again with many passwords until they stumble upon the right one.
Which is why you still need a strong password.

### SQLite

We use SQLite to store our data. SQLite is a database solution that saves the data to a single file.
Unlike PostgreSQL or MySQL/MariaDB or MongoDB there is no setup involved.
Just one file. As such it makes the database really portable, while remaining a strong choice for saving data.
SQLite uses the SQL syntax, so it will be easy in the future to switch to a more advanced database.
