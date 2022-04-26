# API

This document describes how the various routes work on this website.

## `/discord`

The callback endpoint that discord will redirect to.

```http
GET /discord
	?code=DISCORD_OAUTH2_CODE
```

This will either redirect to `/me` on success or throw an error if something went wrong, such as `email` indent not provided or invalid code.

## `/login`

Show the login page

```http
GET /login
```

Send a username and password to log in

```http
POST /login

email="Example@gmail.com"; password="Example"
```

This will set a cookie named `connect.sid` to recognise the user throughout various pages.

## `/logout`

Log out the user

```http
GET /logout
```

This will delete the internal session associated with the user.

## `/me`

> Requires auth!

Show info about the logged in user

```http
GET /me
```

## `/register`

Show the register page

```http
GET /register
```

Make a new account

```http
POST /register

username="Example"; password="Example"; email="Example@gmail.com"
```

## `/users`

See all users saved on the website

```http
GET /users
```
