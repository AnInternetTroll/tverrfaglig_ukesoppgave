# Checklist

- [x] oauth2 supported (~~google~~ discord)
- [x] Local username+password support
- [x] Hashing and salting of passwords

# Development

Good old

You need to make a `users.db` file and set some enviormental variables (or in a `.env` file) before you can start

```sh
PORT=3000
DISCORD_ID=
DISCORD_SECRET=
CALLBACK_URL=
SQLITE=
SECRET=
```

# Production

```sh
npm i --only=production
npm start
```

# Development

```sh
npm i
npm run dev
npm run fmt
```
