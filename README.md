# Internship-Assignment (User Authentication APIs)

This Node.js application provides APIs for user registration, login, and password reset using MongoDB for data storage.

## Prerequisites

- Node.js installed on your machine
- MongoDB installed and running locally or on a remote server

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/anujdhiman111/Internship-Assignment.git
   npm install

2. Start the server:

   ```bash
   nodemon server.js

## API Endpoints

### User Registration
- POST /signup
> Registers a new user with the provided username, email, and password.

### User Login
- POST /login
> Logs in a user with the provided username and password.

### Forgot Password
- POST /forgot-password
> Sends a 4-digit verification code to the user's email address for password reset.

### Reset Password
- PUT /reset-password
> Resets the user's password using the verification code sent to their email.


