# Journal App Backend

This is the backend API server for the Journal Mobile Application. It provides RESTful endpoints for user authentication and journal entry management.

## Technologies Used

- Node.js and Express for the API server
- MySQL for database with Sequelize as ORM
- JWT for authentication
- Swagger for API documentation

## Getting Started

### Prerequisites

- Node.js (v14+)
- MySQL Server

### Installation

1. Clone the repository
2. Navigate to the server directory:
   ```
   cd server
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=journalapp
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```
   
### Database Setup

1. Make sure your MySQL server is running
2. Run the SQL script to create the database and tables:
   ```
   mysql -u root -p < src/config/schema.sql
   ```
   
### Running the Server

- Development mode with auto-reload:
  ```
  npm run dev
  ```
  
- Production mode:
  ```
  npm start
  ```

The server will be available at http://localhost:3000 (or the port you specified in the .env file).

API documentation will be available at http://localhost:3000/api-docs

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get JWT token
- `GET /api/users/profile` - Get user profile (requires authentication)

### Journal Entries

- `GET /api/journal` - Get all journal entries for the logged-in user
- `GET /api/journal/:id` - Get a specific journal entry
- `POST /api/journal` - Create a new journal entry
- `PUT /api/journal/:id` - Update a journal entry
- `DELETE /api/journal/:id` - Delete a journal entry
- `GET /api/journal/search?query=text` - Search journal entries
- `GET /api/journal/streak` - Get streak information

## Project Structure

```
server/
├── src/
│   ├── config/         # Database and app configuration
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   └── index.js        # Entry point
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
└── README.md           # Documentation
``` 