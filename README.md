# Ledger Banking Backend API

A production-ready backend application that simulates the core functionality of a digital banking system. The project is built with Node.js, Express.js, and MongoDB and follows a ledger-based accounting approach, where account balances are derived from transaction history instead of being stored directly.

The application includes secure authentication, account management, money transfers, transaction processing, email notifications, and JWT token blacklisting for logout.

---

## Overview

This project demonstrates the implementation of backend concepts commonly used in financial systems, including authentication, authorization, ledger accounting, MongoDB transactions, idempotency, and secure API design.

Instead of updating account balances directly, every transaction creates corresponding debit and credit ledger entries. The account balance is calculated dynamically using MongoDB's aggregation pipeline, providing a reliable audit trail similar to real banking systems.

---

## Features

### Authentication

- User Registration
- Secure Login using JWT
- Password Hashing with bcrypt
- Cookie-based Authentication
- Protected Routes
- Logout with JWT Blacklisting

### Account Management

- Create Account
- Retrieve User Accounts
- Fetch Account Balance
- Account Status Validation

### Transactions

- Money Transfer Between Accounts
- Initial Fund Transfer by System User
- MongoDB Transactions
- Ledger Entry Creation
- Duplicate Transaction Prevention using Idempotency Keys
- Balance Validation
- Transaction Status Management

### Notifications

- Welcome Email after Registration
- Email Notification after Successful Transactions

---

## Technology Stack

Backend

- Node.js
- Express.js

Database

- MongoDB Atlas
- Mongoose

Authentication

- JSON Web Token (JWT)
- bcrypt

Utilities

- Cookie Parser
- Nodemailer
- dotenv

Deployment

- Render

Testing

- Postman

---

## Project Structure

```
src
│
├── config
│
├── controllers
│
├── middleware
│
├── models
│
├── routes
│
├── services
│
├── app.js
│
└── server.js
```

The project follows a modular MVC architecture, making it easy to maintain and extend.

---

## Database Design

The application consists of the following collections.

### User

Stores user information and authentication details.

### Account

Represents a user's bank account.

### Transaction

Stores every money transfer performed in the system.

### Ledger

Maintains debit and credit entries for every transaction.

### Blacklist

Stores invalidated JWT tokens after logout.

---

## Authentication Flow

1. User registers with email and password.
2. Password is hashed using bcrypt.
3. JWT token is generated after successful registration or login.
4. Token is stored inside an HTTP-only cookie.
5. Protected routes validate the token.
6. During logout, the JWT is stored inside the blacklist collection.
7. Blacklisted tokens are rejected by the authentication middleware.

---

## Ledger-Based Accounting

Unlike traditional applications that maintain a balance field inside the account document, this project follows a ledger system.

Each transaction creates

- One Debit Entry
- One Credit Entry

The account balance is calculated dynamically as

```
Balance = Total Credits − Total Debits
```

This approach provides complete transaction history, prevents balance inconsistencies, and closely resembles how banking systems maintain financial records.

---

## Transaction Flow

Money transfers follow the sequence below.

1. Validate request data.
2. Validate Idempotency Key.
3. Verify sender and receiver accounts.
4. Check account status.
5. Calculate sender balance.
6. Create transaction in pending state.
7. Create debit and credit ledger entries.
8. Mark transaction as completed.
9. Commit MongoDB transaction.
10. Send confirmation email.

---

## API Endpoints

### Authentication

| Method | Endpoint |
|----------|----------------|
| POST | /api/auth/register |
| POST | /api/auth/login |
| POST | /api/auth/logout |

---

### Accounts

| Method | Endpoint |
|----------|-----------------------------|
| POST | /api/accounts |
| GET | /api/accounts |
| GET | /api/accounts/balance/:accountId |

---

### Transactions

| Method | Endpoint |
|----------|-------------------------------------------|
| POST | /api/transactions |
| POST | /api/transactions/system/initial-funds |

---

## Environment Variables

```
PORT=

MONGODB_URI=

JWT_SECRET=

EMAIL_USER=

EMAIL_PASS=
```

---

## Running the Project

Clone the repository

```bash
git clone <repository-url>
```

Install dependencies

```bash
npm install
```

Start development server

```bash
npm run dev
```

---

## Deployment

The backend is deployed on Render.

Deployment includes

- Environment Variables
- MongoDB Atlas
- Production Build
- Automatic GitHub Deployment

---

## Future Improvements

- Refresh Tokens
- Role-Based Authorization
- Redis for Token Blacklisting
- Swagger API Documentation
- Docker Support
- Unit and Integration Testing
- Rate Limiting
- Account Statements
- Transaction History Pagination

---

## Author

**Mansha Vatsh**

B.Tech (Electronics and Communication Engineering)

Backend Developer

GitHub: https://github.com/Manshavatsh0123

LinkedIn: https://www.linkedin.com/in/mansha-vatsh88/

Portfolio: https://manshavatsh90.netlify.app/
