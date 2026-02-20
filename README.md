# Expense Tracker & Budget Planner

A full-stack web application for tracking expenses and managing budgets with Vue3, Node.js, Express, and MongoDB.

## Features

- **User Authentication**: Secure login and registration with JWT
- **Expense Tracking**: Add, view, edit, and delete expenses
- **Budget Management**: Set budgets for different categories and monitor spending
- **Category System**: Organize expenses into predefined categories
- **Monthly Reports**: View spending summaries by month and category
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
ExpenseTracker2/
├── backend/                # Node.js/Express backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── .env.example       # Environment variables template
├── frontend/              # Vue 3 frontend
│   ├── src/
│   │   ├── components/    # Vue components
│   │   ├── views/         # Page views (Login, Register, Dashboard)
│   │   ├── stores/        # Pinia state management
│   │   ├── App.vue        # Root component
│   │   ├── main.js        # Entry point
│   │   ├── router.js      # Vue Router configuration
│   │   └── api.js         # Axios API client
│   ├── index.html         # HTML entry point
│   ├── vite.config.js     # Vite configuration
│   ├── tsconfig.json      # TypeScript configuration
│   └── package.json       # Frontend dependencies
└── README.md             # This file
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas URL)
- npm or yarn

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from `.env.example` and update with your settings:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your configuration:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/expense-tracker
   JWT_SECRET=your_secret_key_here
   ```

5. Start the backend server:
   ```bash
   npm run dev  # For development with nodemon
   # or
   npm start    # For production
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run serve
   ```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Expenses
- `GET /api/expenses` - Get all expenses (with optional filters)
- `GET /api/expenses/:id` - Get specific expense
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Budgets
- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/:id/status` - Get budget with spent amount
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

## MongoDB Setup

If you have MongoDB installed locally:
```bash
# Start MongoDB service (Windows)
net start MongoDB

# Or on macOS
brew services start mongodb-community
```

For MongoDB Atlas (cloud):
1. Create an account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` with your connection string

## Usage

1. **Register**: Create a new account with email and password
2. **Login**: Sign in with your credentials
3. **Add Expenses**: Click "Add Expense" and fill in the details
4. **View Expenses**: See all your expenses filtered by month/category
5. **Set Budgets**: Create budgets for different spending categories
6. **Monitor**: Check the budget progress and spending summary

## Categories

- Food
- Transport
- Entertainment
- Shopping
- Utilities
- Health
- Education
- Other

## Technologies Used

### Backend
- Express.js - Web framework
- MongoDB - Database
- Mongoose - ODM
- JWT - Authentication
- bcryptjs - Password hashing
- CORS - Cross-origin requests

### Frontend
- Vue 3 - UI framework
- Vite - Build tool
- Pinia - State management
- Vue Router - Routing
- Axios - HTTP client

## Environment Variables

**Backend (.env)**:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your_jwt_secret_key_here
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB is accessible

### CORS Error
- Backend is running on port 5000
- Frontend is configured to proxy `/api` requests

### Port Already in Use
- Change `PORT` in backend `.env`
- Change `port` in frontend `vite.config.js`

## Future Features

- [ ] Multi-currency support
- [ ] Recurring expenses
- [ ] Receipt upload
- [ ] Export to CSV/PDF
- [ ] Mobile app
- [ ] Dark mode
- [ ] Spending goals
- [ ] Transaction history filters

## Contributing

Feel free to fork and submit pull requests!

## License

MIT License
