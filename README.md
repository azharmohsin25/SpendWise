# SpendWise — Smart Financial Simulator

SpendWise is a responsive fintech dashboard with a live purchase affordability estimator, EMI planner, transaction entry, savings goals, JWT account access, and a Spring Boot API backed by MySQL.

## Open the demo directly

Double-click `index.html` to open the standalone browser demo. It needs no Docker, Node.js, or backend server; demo entries are kept in that browser's local storage. Account login, password reset, and MySQL-backed sync require the app to run through Vite with the backend.

## Run with Docker Compose

Requires Docker Desktop with Compose. From this directory:

```sh
docker compose up --build
```

Open [http://localhost:5173](http://localhost:5173). The API listens at [http://localhost:8080](http://localhost:8080). The app opens with realistic demo data; click the account avatar to register or sign in and connect a persistent profile.

The compose credentials and JWT key are for local development only. Set unique credentials and a long random `JWT_SECRET` before any deployment. The database schema is updated by Hibernate for local development (`DDL_AUTO=update`); use versioned migrations and a managed secret store for deployment.

## Run locally without Docker

Requirements: Node.js 22.12+ with npm, Java 21+, Maven 3.6.3+, and MySQL 8.4. Set `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, and `APP_WEB_URL` to enable password reset emails.

1. Create a MySQL database named `spendwise` and a user with access to it.
2. In `backend/`, set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET`, then run `mvn spring-boot:run`.
3. In the project root, run `npm install`, then `npm run dev`.
4. Set `VITE_API_URL=http://localhost:8080/api` if the API is hosted somewhere else.

## Main API routes

Public authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

All `/api` routes below require `Authorization: Bearer <token>`:

- `GET /api/dashboard`, `GET/PUT /api/profile`
- `GET/POST /api/incomes`
- `GET/POST/PUT/DELETE /api/expenses`
- `GET/POST/PUT/DELETE /api/goals`
- `GET/POST /api/cards`, `GET/POST /api/cards/{id}/transactions`
- `GET/POST /api/emis`, `POST /api/emi/calculate`
- `POST /api/purchase/assess`, `GET/POST /api/simulations`
- `GET/POST /api/categories`, `GET/POST /api/budgets`
- `GET /api/notifications`, `PATCH /api/notifications/{id}/read`

## Financial logic

- EMI uses the reducing-balance formula and handles a zero-interest rate separately. Amounts are rounded to cents.
- Purchase estimates include balance, income, monthly expenses, EMIs, card obligations, timing, and a three-month expense reserve. They are estimates from user-entered figures; SpendWise does not connect to or verify a bank account.
- The browser demo calculates estimates locally. After signing in, profiles, dated income and expense records, monthly category budgets, credit cards and their transactions, saved EMI plans, savings goals, and purchase history use the API.
- Transaction history can be filtered by type and by day, week, month, year, or all time. The cashflow chart shows six or twelve months of recorded data.

## Tests

Run the backend unit tests with `cd backend && mvn test`. The tests cover zero-interest EMI, standard EMI, and an affordability result that includes a separate emergency reserve.

## Project layout

```text
src/                         React/Vite app and financial calculations
backend/src/main/java/       Spring MVC, services, JPA entities, JWT security
backend/src/main/resources/  API and database configuration
docker-compose.yml           MySQL + API + frontend development stack
```
