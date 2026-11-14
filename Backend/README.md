# Backend Authentication System – Complete Workflow

## 1. Project Overview

This backend application implements a basic user authentication system using:

- **Node.js** – JavaScript runtime environment.
- **Express.js** – Backend framework for creating APIs.
- **MySQL** – Database for storing user information.
- **bcrypt** – Password hashing and verification.
- **JWT (JSON Web Token)** – User authentication.
- **OTP** – Email-based verification.
- **Middleware** – Protecting private API routes.

### Main Features

1. User Registration
2. User Login
3. Forgot Password
4. OTP Generation
5. OTP Verification
6. Password Reset
7. JWT Authentication
8. Protected Routes

---

# 2. Backend Architecture

The backend contains three important parts:

1. **server.js** – Handles API requests and responses.
2. **db.js** – Establishes the MySQL database connection.
3. **utils.js** – Contains reusable utility functions such as OTP generation, email sending, JWT generation and middleware.

### Overall Workflow

```text
React Frontend
      |
      | HTTP Requests
      v
Express.js Backend
      |
      |-------------------|
      |                   |
      v                   v
   MySQL Database      utils.js
                       |
                       |-- generateOTP()
                       |-- sendEmail()
                       |-- generateJWT()
                       |-- JWTmiddleware
```

---

# 3. Understanding Imports

```javascript
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import pool from "./db.js";

import {
  generateOTP,
  currentOTPs,
  sendEmail,
  generateJWT,
  JWTmiddleware
} from "./utils.js";
```

| Import | Purpose |
|---|---|
| express | Creates the backend server and API routes |
| cors | Allows frontend applications from permitted origins to access the backend |
| bcrypt | Hashes and compares passwords |
| pool | Executes MySQL database queries |
| generateOTP | Generates a random OTP |
| currentOTPs | Temporarily stores generated OTPs |
| sendEmail | Sends OTP through email |
| generateJWT | Generates an authentication token |
| JWTmiddleware | Verifies JWT before allowing access to protected routes |

---

# 4. Express Initialization and Middleware

```javascript
const app = express();

app.use(cors({ origin: "*" }));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
```

### 4.1 Express Initialization

```javascript
const app = express();
```

Creates an Express application.

Express receives HTTP requests and directs them to the appropriate API routes.

### 4.2 CORS

```javascript
app.use(cors({ origin: "*" }));
```

CORS stands for Cross-Origin Resource Sharing.

It allows frontend applications running on different origins to communicate with the backend.

Example:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

For production, restrict CORS to your actual frontend domain.

### 4.3 JSON Middleware

```javascript
app.use(express.json());
```

Converts incoming JSON request data into a JavaScript object.

Example frontend request:

```javascript
{
  email: "ramuforexample@gmail.com",
  password: "example"
}
```

We can access this data using:

```javascript
req.body
```

### 4.4 URL-Encoded Middleware

```javascript
app.use(express.urlencoded({ extended: true }));
```

Handles data submitted through traditional HTML forms using URL-encoded format.

---

# 5. GET `/` – Server Health Check

```javascript
app.get("/", (req, res) => {
  res.status(200).send("This was the message from the server");
});
```

### Workflow

1. Browser sends a GET request.
2. Express identifies the `/` route.
3. The callback function executes.
4. Server sends a response.
5. Browser displays the message.

### Important Concepts

- `req` – Incoming request.
- `res` – Outgoing response.
- `200` – HTTP success status code.
- `send()` – Sends a response to the client.

---

# 6. POST `/register-new-user` – User Registration

This API creates a new user account.

### Code

```javascript
app.post("/register-new-user", async (req, res) => {

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  const passwordHash = await bcrypt.hash(password, 12);

  const newUser = await pool.query(
    `insert into users(name,email,password)
     value('${name}','${email}','${passwordHash}')`
  );

  res.status(200).json({
    message: "New user Registered Successfully!"
  });

});
```

### Step-by-Step Workflow

**Step 1: Frontend sends registration details**

```javascript
{
  name: "Ramu",
  email: "ramu@gmail.com",
  password: "123456"
}
```

**Step 2: Extract the user information**

```javascript
const name = req.body.name;
const email = req.body.email;
const password = req.body.password;
```

We extract the values from `req.body`.

**Step 3: Hash the password**

```javascript
const passwordHash = await bcrypt.hash(password, 12);
```

Instead of storing the original password, we store its bcrypt hash.

Example:

```text
Original Password: 123456

        |
        v

bcrypt.hash(password, 12)

        |
        v

Generated Hash: $2b$12$...
```

`12` represents the bcrypt cost factor.

**Step 4: Insert user information into MySQL**

```sql
INSERT INTO users(name, email, password)
VALUES('Ramu', 'ramu@gmail.com', 'HASH_VALUE');
```

The database stores the user's name, email and password hash.

**Step 5: Send response**

```javascript
res.status(200).json({
  message: "New user Registered Successfully!"
});
```

### Important Concepts

- `bcrypt.hash()` – Hashes a password.
- `pool.query()` – Executes a database query.
- `INSERT INTO` – Inserts a new record into MySQL.
- `req.body` – Contains frontend request data.
- `res.json()` – Sends a JSON response.

---

# 7. POST `/user-login` – User Login

This API authenticates an existing user using email and password.

### Code

```javascript
app.post("/user-login", async (req, res) => {

  const email = req.body.email;
  const password = req.body.password;

  const user = await pool.query(
    `select * from users where email = '${email}'`
  );

  const passwordHash = user[0][0].password;

  const isPassword = await bcrypt.compare(
    password,
    passwordHash
  );

  if (isPassword) {

    const acessToken = generateJWT({
      email: user[0][0].email,
      name: user[0][0].name,
    });

    res.status(200).json({
      userAuthenticated: true,
      acessToken: acessToken
    });

  } else {

    res.status(401).json({
      userAuthenticated: false
    });

  }

});
```

### Step-by-Step Workflow

**Step 1: Frontend sends login credentials**

```javascript
{
  email: "ramu@gmail.com",
  password: "123456"
}
```

**Step 2: Extract email and password**

```javascript
const email = req.body.email;
const password = req.body.password;
```

**Step 3: Find the user in MySQL**

```javascript
const user = await pool.query(
  `select * from users where email = '${email}'`
);
```

The database searches for a matching email.

**Step 4: Extract the stored password hash**

```javascript
const passwordHash = user[0][0].password;
```

Assuming the standard MySQL2 query result format:

- `user[0]` – Array of returned rows.
- `user[0][0]` – First user record.
- `user[0][0].password` – Stored password hash.

**Step 5: Compare the entered password**

```javascript
const isPassword = await bcrypt.compare(
  password,
  passwordHash
);
```

`bcrypt.compare()` checks whether the entered password matches the stored password hash.

It returns a Boolean value:

```javascript
true  // Password matches
false // Password doesn't match
```

Important difference:

```javascript
bcrypt.hash()
```

Used during registration and password reset.

```javascript
bcrypt.compare()
```

Used during login to verify the password.

**Step 6: Generate JWT**

```javascript
const acessToken = generateJWT({
  email: user[0][0].email,
  name: user[0][0].name,
});
```

If the password matches, the backend generates a JWT containing the supplied user information.

**Step 7: Send the response**

Successful login:

```javascript
{
  userAuthenticated: true,
  acessToken: "JWT_TOKEN"
}
```

Incorrect password:

```javascript
{
  userAuthenticated: false
}
```

### Important Concepts

- `SELECT` – Retrieves records from MySQL.
- `bcrypt.compare()` – Verifies passwords.
- `generateJWT()` – Generates an authentication token.
- `401` – Unauthorized.
- `200` – Successful request.

---

# 8. POST `/forgot-password` – Forgot Password

This API generates an OTP and sends it to the user's registered email address.

### Code

```javascript
app.post("/forgot-password", async (req, res) => {

  const { email } = req.body;

  const user = await pool.query(
    `select * from users where email = '${email}'`
  );

  if (user[0].length == 0) {

    res.status(404).json({
      message: "User Not Found"
    });

  } else {

    let generatedOTP = generateOTP();

    currentOTPs[email] = generatedOTP;

    sendEmail(email, generatedOTP)

      .then((data) => {

        res.status(200).json({
          message: "OTP Sent"
        });

      })

      .catch((err) => {

        res.status(500).json({
          message: "Error At Server"
        });

      })

      .finally(() => {

        console.log(currentOTPs);

      });

  }

});
```

### Step-by-Step Workflow

**Step 1: Frontend sends email**

```javascript
{
  email: "ramu@gmail.com"
}
```

**Step 2: Check whether the user exists**

```javascript
const user = await pool.query(
  `select * from users where email = '${email}'`
);
```

**Step 3: Check the number of returned records**

```javascript
if (user[0].length == 0)
```

If the returned rows array has zero elements, the user doesn't exist.

Return:

```javascript
res.status(404).json({
  message: "User Not Found"
});
```

**Step 4: Generate OTP**

```javascript
let generatedOTP = generateOTP();
```

The `generateOTP()` function generates a random OTP.

Example:

```text
482913
```

**Step 5: Store OTP in an object**

```javascript
currentOTPs[email] = generatedOTP;
```

Suppose:

```javascript
const currentOTPs = {};
```

After execution:

```javascript
currentOTPs["ramu@gmail.com"] = "482913";
```

The object becomes:

```javascript
{
  "ramu@gmail.com": "482913"
}
```

Here:

- Key = Email.
- Value = Generated OTP.

**Step 6: Send OTP through email**

```javascript
sendEmail(email, generatedOTP)
```

The email utility receives:

- Recipient email.
- Generated OTP.

**Step 7: Handle Promise responses**

`.then()`:

Executes when the email operation succeeds.

`.catch()`:

Executes when the email operation fails.

`.finally()`:

Executes whether the Promise succeeds or fails.

### Important Concepts

- `generateOTP()` – Generates OTP.
- `currentOTPs` – Temporarily stores OTP.
- `Object` – Stores key-value pairs.
- `.then()` – Handles successful Promise execution.
- `.catch()` – Handles Promise errors.
- `.finally()` – Executes after Promise completion.

---

# 9. POST `/verify-otp` – OTP Verification

This API verifies whether the OTP entered by the user matches the generated OTP.

### Code

```javascript
app.post("/verify-otp", async (req, res) => {

  try {

    const { email, OTP } = req.body;

    if (Object.keys(currentOTPs).includes(email)) {

      if (currentOTPs[email] == OTP) {

        res.status(200).json({
          message: "OTP Verified Successfully"
        });

      } else {

        res.status(401).json({
          message: "OTP is not Valid"
        });

      }

    } else {

      res.status(404).json({
        message: "OTP does not Exist for this Email"
      });

    }

  } catch (err) {

    console.log(err.message);

  }

});
```

### Step-by-Step Workflow

**Step 1: Frontend sends email and OTP**

```javascript
{
  email: "ramu@gmail.com",
  OTP: "482913"
}
```

**Step 2: Understand Object.keys()**

Suppose:

```javascript
const currentOTPs = {
  "ramu@gmail.com": "482913",
  "user@gmail.com": "123456"
};
```

Execute:

```javascript
Object.keys(currentOTPs);
```

Output:

```javascript
[
  "ramu@gmail.com",
  "user@gmail.com"
]
```

`Object.keys()` returns all the keys of an object as an array.

**Step 3: Check whether the email exists**

```javascript
Object.keys(currentOTPs).includes(email);
```

This checks whether the given email exists as a key in the object.

**Step 4: Compare the OTP**

```javascript
currentOTPs[email] == OTP;
```

Example:

```javascript
currentOTPs[email] // "482913"
OTP                // "482913"
```

Both values match, so verification succeeds.

**Step 5: Send appropriate response**

| Condition | Status Code | Response |
|---|---|---|
| OTP matches | 200 | OTP verified |
| OTP doesn't match | 401 | Invalid OTP |
| OTP doesn't exist | 404 | OTP not found |

### Important Concepts

- `Object.keys()` – Returns object keys.
- `.includes()` – Checks whether an array contains a value.
- `currentOTPs[email]` – Accesses the OTP using the email as the key.
- `try/catch` – Handles errors.

**Important:** The current implementation doesn't delete OTP after successful verification. It also doesn't have OTP expiration or attempt limits. These should be added before production.

---

# 10. POST `/update-newPassword` – Update New Password

This API updates the user's password in MySQL.

### Code

```javascript
app.post("/update-newPassword", async (req, res) => {

  try {

    const { email, Newpassword } = req.body;

    const passwordHash = await bcrypt.hash(
      Newpassword,
      10
    );

    const DBquery = await pool.query(
      `update users set password = '${passwordHash}'
       where email = '${email}'`
    );

    res.status(200).json({
      message: "Password Updated Successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(401).json({
      message: "ERROR: While updating the Password"
    });

  }

});
```

### Step-by-Step Workflow

**Step 1: Frontend sends new password details**

```javascript
{
  email: "ramu@gmail.com",
  Newpassword: "mynewpassword123"
}
```

**Step 2: Extract email and password**

```javascript
const { email, Newpassword } = req.body;
```

**Step 3: Hash the new password**

```javascript
const passwordHash = await bcrypt.hash(
  Newpassword,
  10
);
```

The new password is converted into a bcrypt hash.

**Step 4: Update the password in MySQL**

```sql
UPDATE users
SET password = 'NEW_HASH'
WHERE email = 'ramu@gmail.com';
```

**Step 5: Send response**

```javascript
res.status(200).json({
  message: "Password Updated Successfully"
});
```

### Important Concepts

- `UPDATE` – Modifies an existing database record.
- `bcrypt.hash()` – Hashes the new password.
- `WHERE` – Identifies which record should be updated.

**Security warning:** Your current `/update-newPassword` API doesn't verify whether the user has successfully completed OTP verification.

A secure implementation must require a short-lived, single-use password-reset authorization token before allowing the password change.

---

# 11. GET `/my-profile-data` – Protected Route

This API demonstrates how to protect a route using JWT middleware.

### Code

```javascript
app.get(
  "/my-profile-data",
  JWTmiddleware,
  (req, res) => {

    res.status(200).json({
      message: "only You should Acess this Page"
    });

  }
);
```

### What is Middleware?

Middleware is a function that executes between receiving an HTTP request and sending the final response.

Think of middleware as a security guard.

The guard checks the identity card before allowing someone to enter a restricted area.

Similarly, JWT middleware verifies the user's authentication token.

### Step-by-Step Workflow

**Step 1: Frontend sends a request**

```javascript
axios.get("/my-profile-data", {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

**Step 2: JWT middleware executes**

```javascript
JWTmiddleware
```

The middleware checks the token sent by the frontend.

**Step 3: Extract the token**

An example middleware implementation:

```javascript
const authHeader = req.headers.authorization;

const token = authHeader?.split(" ")[1];
```

Suppose:

```javascript
const authHeader = "Bearer ABC123";
```

Execute:

```javascript
authHeader.split(" ");
```

Output:

```javascript
["Bearer", "ABC123"]
```

Therefore:

```javascript
authHeader.split(" ")[1];
```

Returns:

```text
ABC123
```

**Step 4: Verify the token**

```javascript
const decoded = jwt.verify(
  token,
  process.env.JWT_SECRET
);
```

JWT verifies the token's signature and expiration.

If valid, it returns the decoded payload.

**Step 5: Attach decoded data to request**

```javascript
req.user = decoded;
```

Now the next route handler can access the authenticated user's information through `req.user`.

**Step 6: Call next()**

```javascript
next();
```

`next()` tells Express to continue to the next middleware or route handler.

Therefore, the protected route executes.

### What happens if the token is invalid?

The middleware sends an unauthorized response, and the protected route does not execute.

### Important Concepts

- `Authorization` – HTTP request header used to send authentication credentials.
- `Bearer Token` – Common format for sending JWT.
- `jwt.verify()` – Verifies the token.
- `req.user` – Stores decoded user information for subsequent handlers.
- `next()` – Continues request processing.
- `401` – Unauthorized.

---

# 12. app.listen() – Starting the Backend Server

```javascript
app.listen(3000, () => {
  console.log("Server Successfully running on port 3000!");
});
```

This starts the Express server.

The backend listens for incoming requests on port `3000`.

Base URL:

```text
http://localhost:3000
```

---

# 13. Complete API Endpoint Summary

| HTTP Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Server health check |
| POST | `/register-new-user` | Register a new user |
| POST | `/user-login` | Authenticate an existing user |
| POST | `/forgot-password` | Generate and send OTP |
| POST | `/verify-otp` | Verify OTP |
| POST | `/update-newPassword` | Update password |
| GET | `/my-profile-data` | Access protected route |

---

# 14. Complete Authentication Workflow

## A. User Registration

```text
React Registration Form
        |
        v
POST /register-new-user
        |
        v
Extract name, email, password
        |
        v
Hash password using bcrypt
        |
        v
Insert user into MySQL
        |
        v
Send success response
        |
        v
Account Created
```

## B. User Login

```text
React Login Form
        |
        v
POST /user-login
        |
        v
Extract email and password
        |
        v
Find user in MySQL
        |
        v
Extract stored password hash
        |
        v
Compare password using bcrypt
        |
        v
    Password Match?
       /       \
     Yes        No
      |          |
      v          v
 Generate JWT  Return 401
      |
      v
 Send JWT to Frontend
      |
      v
 User Authenticated
```

## C. Forgot Password

```text
User enters registered email
        |
        v
POST /forgot-password
        |
        v
Check user in MySQL
        |
        v
Generate OTP
        |
        v
Store OTP in currentOTPs
        |
        v
Send OTP through email
        |
        v
User enters received OTP
        |
        v
POST /verify-otp
        |
        v
Compare entered OTP
        |
        v
OTP Verified
        |
        v
Generate temporary reset authorization
        |
        v
Validate reset authorization
        |
        v
Update password using bcrypt
        |
        v
Password Reset Completed
```

---

# 15. Important Backend Concepts Revision

| Concept | Purpose |
|---|---|
| `async/await` | Handles asynchronous operations |
| `req.body` | Accesses frontend request data |
| `res.json()` | Sends JSON responses |
| `bcrypt.hash()` | Hashes passwords |
| `bcrypt.compare()` | Compares entered password with stored hash |
| `pool.query()` | Executes MySQL queries |
| `SELECT` | Retrieves database records |
| `INSERT INTO` | Inserts new records |
| `UPDATE` | Updates existing records |
| `Object.keys()` | Returns object keys |
| `.includes()` | Checks whether an array contains a value |
| `.then()` | Handles successful Promise execution |
| `.catch()` | Handles Promise errors |
| `.finally()` | Executes after Promise completion |
| `generateJWT()` | Generates JWT |
| `jwt.verify()` | Verifies JWT |
| `next()` | Continues middleware execution |
| HTTP 200 | Successful request |
| HTTP 401 | Unauthorized |
| HTTP 404 | Resource not found |
| HTTP 500 | Internal server error |

---

# 16. Important Security Improvements

Before deploying this authentication system in production, implement these improvements.

### 1. Prevent SQL Injection

Current approach:

```javascript
const user = await pool.query(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

Better approach:

```javascript
const user = await pool.query(
  "SELECT * FROM users WHERE email = ?",
  [email]
);
```

Use parameterized queries for all user-provided SQL values.

### 2. Handle Users Who Don't Exist

Before accessing:

```javascript
user[0][0].password
```

Check:

```javascript
if (user[0].length === 0) {
  return res.status(401).json({
    message: "Invalid email or password"
  });
}
```

### 3. Add OTP Expiration

OTP should:

- Expire after a short period, such as 5 minutes.
- Have a maximum number of verification attempts.
- Be used only once.
- Be generated using a cryptographically secure random generator.
- Be protected against repeated OTP requests.

### 4. Secure Password Reset

Do not allow users to update passwords using only an email address.

Require a valid, short-lived, single-use reset authorization token after successful OTP verification.

### 5. Add Error Handling

Use `try/catch` in asynchronous API routes.

Always send an appropriate HTTP response when an error occurs.

### 6. Avoid Logging Sensitive Information

Remove debugging statements that expose:

```javascript
console.log(req.body);
console.log(passwordHash);
console.log(currentOTPs);
```

Never log plaintext passwords, password hashes, OTPs or authentication tokens.

### 7. Validate User Input

Validate:

- Name
- Email
- Password
- OTP
- New password

Also enforce a unique constraint on the email column.

### 8. Configure CORS Properly

Instead of:

```javascript
app.use(cors({ origin: "*" }));
```

Restrict allowed origins to your actual frontend domain in production.

---

# 17. Recommended Backend Folder Structure

As your project grows, organize your backend like this:

```text
Backend/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── authController.js
│   └── userController.js
│
├── middleware/
│   └── authMiddleware.js
│
├── routes/
│   ├── authRoutes.js
│   └── userRoutes.js
│
├── utils/
│   └── utils.js
│
├── .env
├── .gitignore
├── package.json
└── server.js
```

### Responsibilities

| File | Responsibility |
|---|---|
| server.js | Initializes Express and registers routes |
| db.js | Establishes database connection |
| authRoutes.js | Defines authentication endpoints |
| authController.js | Handles authentication logic |
| userController.js | Handles user-related operations |
| authMiddleware.js | Verifies JWT |
| utils.js | Contains reusable utility functions |
| .env | Stores environment variables |

This architecture separates responsibilities and makes the backend easier to maintain.

---

# 18. Final Revision – Remember These Concepts

1. **Registration:** Receive user details → Hash password → Store in MySQL.

2. **Login:** Receive credentials → Find user → Compare password → Generate JWT.

3. **Forgot Password:** Receive email → Check user → Generate OTP → Store OTP → Send email.

4. **OTP Verification:** Receive email and OTP → Check stored OTP → Compare values.

5. **Password Reset:** Verify reset authorization → Hash new password → Update MySQL.

6. **JWT Authentication:** Receive token → Verify token → Attach user information → Allow protected route access.

7. **Middleware:** Executes before the route handler and controls whether the request can continue.

8. **next():** Passes control to the next middleware or route handler.

**Core concept to remember:**

Authentication answers the question: "Who are you?"

Authorization answers the question: "What are you allowed to access?"

JWT helps establish authentication, while your backend must separately enforce authorization for protected resources.

---

## Next Learning Topics

- Express.js Request-Response Lifecycle
- MySQL Connection Pooling
- bcrypt Password Hashing
- JWT Authentication Internals
- Express Middleware
- OTP Verification Security
- MVC Architecture
- REST API Best Practices

**Revision goal:** Understand how data travels from the React frontend to Express, how Express communicates with MySQL, and how authentication is maintained through JWT.