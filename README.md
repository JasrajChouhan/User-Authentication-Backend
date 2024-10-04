
# Role-based User Authentication Backend

This project is a backend system that implements role-based user authentication with various user-related functionalities. The project is built using **Node.js**, **Express.js**, and **TypeScript**, with password hashing provided by the **bcrypt** library. It follows an advanced **MVC (Model-View-Controller)** architecture, making it easy to modify and scale.

## Features
- User Registration and Login
- Role-based Access Control
- Password Management (Hashing with `bcrypt`)
- Token-based Authentication
- Email and Password Update Functionality
- Account Deletion
- Access Token Refresh

---

## API Documentation

### 1. Register/Signup a User
- **Method**: `POST`
- **Endpoint**: `/api/v1/users/signup`
- **Request Body**:
  ```json
  {
      "username": "<your_username>",
      "email": "<your_email>",
      "password": "<your_password>"
  }
  ```

### 2. Login/Signin a User
- **Method**: `POST`
- **Endpoint**: `/api/v1/users/signin`

#### Request Body (Login with username and email)
```json
{
    "username": "<your_username>",
    "email": "<your_email>"
}
```

#### Request Body (Login with email and password)
```json
{
    "email": "<your_email>",
    "password": "<your_password>"
}
```

### 3. Logout a User
- **Method**: `GET | POST | PATCH`
- **Endpoint**: `/api/v1/users/logout`

### 4. Change User Password
- **Method**: `POST`
- **Endpoint**: `/api/v1/users/change/password`
- **Request Body**:
  ```json
  {
      "oldPassword": "<your_old_password>",
      "newPassword": "<your_new_password>",
      "confirmPassword": "<your_confirm_password>"
  }
  ```

### 5. Change User Email
- **Method**: `POST`
- **Endpoint**: `/api/v1/users/change/email`
- **Request Body**:
  ```json
  {
      "oldEmail": "<your_old_email>",
      "newEmail": "<your_new_email>"
  }
  ```

### 6. Refresh Access Token
- **Method**: `GET`
- **Endpoint**: `/api/v1/users/refreshAccessToken`

### 7. Permanently Delete User Account
- **Method**: `DELETE`
- **Endpoint**: `/api/v1/users/delete`



### 8. Get all info of current logged-in user
- **Method**: `GET`
- **Endpoint**: `/api/v1/users/me`



### 9. Get user details by userId
- **Method**: `GET`
- **Endpoint**: `/api/v1/user/:id`

---

## Setup and Installation

### 1. Clone the Repository
To set up the project locally, ensure that `git` is installed on your system and run the following commands:

```bash
git init
git clone https://github.com/JasrajChouhan/User-Authentication-Backend.git
```

### 2. Install Dependencies
Navigate to the root directory of the project and install the necessary dependencies using `npm`:

```bash
npm install
```

---

## Running the Project

1. Ensure you are in the root directory of the project.
2. Start the development server using the following command:

```bash
npm run dev
```

The project will be available on `localhost` at the specified port. You can now interact with the API using tools like Postman or via the browser for `GET` requests.

---

## Technical Stack

This project uses the following technologies:

1. **Node.js**: JavaScript runtime environment.
2. **Express.js**: Web framework for Node.js.
3. **TypeScript**: JavaScript with static types.
4. **bcrypt**: Library for hashing passwords.

---

## Project Architecture

The project follows the **MVC (Model-View-Controller)** pattern:

- **Model**: Represents the data structure. If you're using a database, modify the model files accordingly.
- **View**: Not applicable as this is an API-only backend.
- **Controller**: Contains the business logic and interacts with the Model to process requests.

To use another database, you can modify the model files and the repository layer as per your needs.

---

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

---

## Contributing

Feel free to fork the repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

---

## Acknowledgements

If you find it helpful, don't forget to give it a ⭐️!
