# Quick Start Guide - Expense Tracker & Budget Planner

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)

### Quick Setup (5 minutes)

#### Step 1: Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```
Backend runs on: `http://localhost:5000`

#### Step 2: Frontend Setup (in new terminal)
```bash
cd frontend
npm install
npm run serve
```
Frontend runs on: `http://localhost:3000`

#### Step 3: Access the App
Open your browser and go to: `http://localhost:3000`

### First Steps
1. Click **Register** to create an account
2. Fill in your details and submit
3. You'll be automatically logged in
4. Start adding expenses!

## 📋 Features Overview

### Dashboard Tabs

**Expenses Tab**
- Add new expenses with amount, category, and date
- View all expenses in a list
- Filter by month and category
- Delete expenses
- See total spending

**Budgets Tab**
- Create monthly budgets per category
- Track spending against budget limits
- Visual progress bars
- Delete budgets

**Summary Tab**
- View total expenses for the selected month
- See breakdown by category
- Quick overview of spending patterns

## 📊 Expense Categories
- Food
- Transport
- Entertainment
- Shopping
- Utilities
- Health
- Education
- Other

## 🛠️ Troubleshooting

**MongoDB Connection Error?**
- Make sure MongoDB is running
- Check MONGODB_URI in backend/.env

**Port Already in Use?**
- Change PORT in backend/.env (currently 5000)
- Change port in frontend/vite.config.js (currently 3000)

**CORS Errors?**
- Ensure backend is running on port 5000
- Ensure frontend proxy is pointing to the correct backend URL

## 📚 API Documentation

See backend REST endpoints in the main README.md

## 💡 Pro Tips

1. Set realistic budgets for each category
2. Review your spending monthly
3. Use categories consistently for better tracking
4. Check the summary tab regularly

## 🔐 Security Notes

- Passwords are hashed with bcryptjs
- JWT tokens expire in 7 days
- Tokens are stored in localStorage (consider using httpOnly cookies in production)
- Each user can only access their own data

## Next Steps

- Customize the UI colors in Vue component styles
- Add more expense categories
- Implement recurring expenses
- Add export to CSV feature
- Deploy to production!

Enjoy tracking your expenses! 💰
