#  Reusable Auth Microservice (Node.js + MongoDB + Redis + JWT)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

A production-ready **Authentication Microservice** built with Node.js, Express, MongoDB and Redis.
Designed with scalable authentication practices including session persistence, refresh token rotation, Redis-based temporary credential storage, and role-based access control.

This service can be integrated into any web application to handle authentication securely and independently.

 GitHub Repo: https://github.com/akaameet/Auth-Service.git

---

## Features

- User Registration & Login  
- JWT Authentication  
- Refresh Token Rotation
- MongoDB Session Storage  
- Email Verification (OTP via Redis)  
- Forgot Password / Reset Password (Token via Redis)  
- Role-Based Authorization (User / Admin)  
- Rate Limiting for Security  
- Secure Cookie Authentication  
- Email Sending using Nodemailer + Google OAuth2  
- Reusable Microservice Architecture  

---

## Project Purpose

Instead of building authentication inside every project, this microservice acts as a **central auth server** that any app can use.

Think of it like inspired by centralized authentication platforms like Auth0 and Firebase Auth.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB |
| Cache (Temporary Tokens) | Redis |
| Authentication | JWT |
| Email Service | Nodemailer + Google OAuth2 |
| Security | bcrypt, httpOnly cookies, rate limiting |
---

## Project Structure

```
src/
│
├── config/
├── db/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── app.ts
└── server.ts
```

---

## 🔐 Token & Session Architecture

| Feature | Storage |
|---|---|
| User Data | MongoDB |
| Sessions | MongoDB |
| Email Verification OTP | Redis (TTL) |
| Password Reset Token | Redis (TTL) |
| Authentication | JWT |
---

## Authentication Flow

### Register Flow

1. User registers
2. OTP stored in Redis with expiry
3. User verifies email via OTP
4. Account becomes active

---

### Login Flow

1. Validate credentials  
2. Generate JWT token  
3. Create session in MongoDB  
4. Send refreshToken via httpOnly cookie  

---

### Refresh Token Flow

1. Client sends refresh token  
2. Server validates session and token integrity  
3. Old refresh token is invalidated  
4. New access token + refresh token are issued  
5. Updated session stored securely

---

### Forgot Password Flow

1. User requests password reset  
2. OTP stored in Redis (expires automatically)  
3. User resets password using OTP  

---

## Environment Variables

Create `.env` file:

```
MONGODB_URI=your_mongodb_uri

JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
GOOGLE_USER=your_google_email

REDIS_USERNAME=default
REDIS_PASSWORD=your_redis_password
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
```

---

## Installation

```bash
git clone https://github.com/akaameet/Auth-Service.git
cd Auth-Service
npm install
```

---

## Run Server

```bash
npm run dev
```

Server runs at:

```
http://localhost:5000
```

---

## API Routes

### Auth Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/verify-email | Verify email via OTP |
| POST | /api/auth/login | Login user |
| POST | /api/auth/forgot-password | Send password reset OTP |
| POST | /api/auth/reset-password | Reset password |
| POST | /api/auth/refresh-token | Refresh JWT |
| POST | /api/auth/logout | Logout current session |
| POST | /api/auth/logout-All | Logout from all devices |

---

### Protected Routes (Role Based)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | /api/protected/user | User | Get user data |
| GET | /api/protected/admin | Admin | Admin dashboard |

---

## Example API Response

### Register Response

```json
{
    "message": "User registered. Please verify your email",
    "user": {
        "id": "69fee...........",
        "username": "Amit Rai",
        "email": "raiamit078@gmail.com",
        "verified": false
    }
}
```
### Email verify Response

```json
{
    "message": "Email verified successfully",
    "user": {
        "username": "Amit Rai",
        "email": "raiamit078@gmail.com",
        "verified": true
    }
}
```
### Login Success Response

```json
{
    "message": "User login successfully",
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "id": "69feefa21a3f82265c7f678a",
        "username": "Amit Rai",
        "email": "raiamit078@gmail.com",
        "role": "user"
    }
}
> The refresh token is securely stored in an httpOnly cookie.
```

## Security Features

- Password hashing with bcrypt  
- Redis OTP expiry (auto delete)  
- Rate limiting for login/register/OTP  
- Role-based authorization middleware  
- Secure cookie authentication  
- Session invalidation on logout  

---

## How To Use With Frontend

Any frontend (React, Next.js, Mobile apps) can use this service by calling the API endpoints.

This makes authentication **reusable across multiple projects**.

---

## Future Improvements

- Multi-Factor Authentication (MFA)
- Docker Deployment
- Account lockout protection

---

## Author

**Amit Rai**

If this project helped you, give the repo a ⭐
