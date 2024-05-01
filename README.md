
# User Authentication API

Introduction

Welcome to the User Authentication API. This API provides secure registration, login, and password management features for your application. With industry-standard security measures, it ensures the confidentiality of user data. Easy integration and clear documentation make it ideal for any project requiring user authentication. Get started today for a seamless and reliable authentication experience!




## Features
1) User Registration: Allows users to register by providing their name, email, password, and terms and conditions agreement. Passwords are securely hashed before storage.

2) User Login: Enables users to log in with their registered email and password. Passwords are securely compared using bcrypt.

3) Change User Password: Provides an endpoint for users to change their password after logging in. New passwords are securely hashed before updating the database.

4) Reset Password via Email: Allows users to reset their password by sending a reset link to their registered email address. Tokens are generated and verified using JWT for secure password reset.

5) Password Reset: After receiving the reset link, users can reset their password by providing a new password and confirming it. Passwords are securely hashed before updating the database.



## Tech Stack

**Server:** Node.js,Express.js

**Tool:** Postman,Jsonwebtoken (JWT),Mongoose

**Database:** MongoDB

## Prerequisites

1) Git installed on your system.





## Installation



```bash
 git clone https://github.com/rushabhkhandhar/Backend_server.git
 npm install
 Set up environment variables required for the API. Ensure to set values for variables such as JWT_SECRET_KEY for token generation. You can create a .env file in the root directory and define your variables there.
 npm run dev
 
```


## API Reference

#### User Registration

```http
POST /api/user/register
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `name` | `string` | **Required**. User's name  |
| `email` | `string` | **Required**. User's email address |
| `password` | `string` | **Required**. User's chosen password |
| `cpassword` | `string` | **Required**. User's chosen password |
| `tc` | `boolean` | **Required**. Agreement to terms and conditions (Boolean) |

#### User Login

```http
POST /api/user/login
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |

| `email` | `string` | **Required**. User's email address |
| `password` | `string` | **Required**. User's chosen password |



Similarly, you can test the other APIs using Postman



## Feedback

If you have any feedback, please reach out to me at rushabhkhandhar38@gmail.com
