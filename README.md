## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# Docker
$ docker compose up

# development
$ npm run start

# watch mode
$ npm run dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Tests my main APIs
This repository is a Nest framework TypeScript starter repository. It contains two APIs: `/register` and `/login`. 
The `/login` API has a rate limit of 3 requests per 5 minutes, and the rate limit data is cached in Redis.
Also I setup the throttler services to limit the requests in global.

1.  Register API: POST - `http://localhost:8888/api/auth/register` with body contains: email, password
2.  Login API: POST - `http://localhost:8888/api/auth/login` with body contains: email, password


