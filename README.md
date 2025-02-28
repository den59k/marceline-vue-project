# Marceline Vue project

Starter project for using [Marceline](https://github.com/den59k/marceline) framework for backend, and Vue3 for frontend

## Development

Create `.env` file with variable, like 

```
PG_DATABASE_URL=postgres://<user>:<pass>@localhost:5432/test
```

Run test init migration (with admin user)

```
yarn prisma db push
```