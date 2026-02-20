const express = require('express');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all budgets for user
router.get('/', auth, async (req, res) => {
  try {
    const { month } = req.query;
    let query = { userId: req.userId };

    if (month) {
      query.month = month;
    }

    const budgets = await Budget.find(query);
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get budget with spent amount
router.get('/:id/status', auth, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    if (budget.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const [year, month] = budget.month.split('-');
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const spent = await Expense.aggregate([
      {
        $match: {
          userId: budget.userId,
          category: budget.category,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: { _id: null, total: { $sum: '$amount' } }
      }
    ]);

    const spentAmount = spent[0]?.total || 0;

    res.json({
      budget: budget.toObject(),
      spent: spentAmount,
      remaining: budget.limit - spentAmount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create budget
router.post('/', auth, async (req, res) => {
  try {
    const { category, limit, month } = req.body;

    if (!category || !limit || !month) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const existingBudget = await Budget.findOne({
      userId: req.userId,
      category,
      month
    });

    if (existingBudget) {
      return res.status(400).json({ message: 'Budget for this category and month already exists' });
    }

    const budget = new Budget({
      userId: req.userId,
      category,
      limit,
      month
    });

    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update budget
router.put('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    if (budget.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(budget, req.body);
    await budget.save();
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete budget
router.delete('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    if (budget.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Budget.deleteOne({ _id: req.params.id });
    res.json({ message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
