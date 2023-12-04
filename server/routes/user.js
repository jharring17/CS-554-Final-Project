import * as goals from '../data/goals.js';
import * as users from '../data/users.js';
import * as expenses from '../data/expenses.js';
import * as validate from '../../validation.js';
import { Router } from 'express';
const router = Router();

router.route('/:userId/feed').get(async (req, res) => {
	//validate the id
	let id = req.params.userId;
	try {
		id = validate.validId(id);
	} catch (e) {
		return res.status(400).json({ error: e });
	}
	try {
		let feed = await users.getFeed(id);
		return res.status(200).json({ feed: feed });
	} catch (e) {
		return res.status(404).json({ error: e });
	}
});

router.route('/:userId/:goalId/like').post(async (req, res) => {
	//validate the ids
	let userId = req.params.userId;
	let goalId = req.params.goalId;
	try {
		userId = validate.validId(userId);
		goalId = validate.validId(goalId);
	} catch (e) {
		return res.status(400).json({ error: e });
	}
	try {
		let updatedGoal = await goals.likePost(userId, goalId);
		return res.status(200).json({ updatedGoal: updatedGoal });
	} catch (e) {
		return res.status(404).json({ error: e });
	}
});

/* ---------------------------------- Expense Routes ---------------------------------- */

// GET: get a single expense by expenseId.
router.route('/:userId/:goalId/:expenseId').get(async (req, res) => {
	// Validate the ids.
	let userId = req.params.userId;
	let goalId = req.params.goalId;
	let expenseId = req.params.expenseId;
	try {
		userId = validate.validId(userId);
		goalId = validate.validId(goalId);
		expenseId = validate.validId(expenseId);
	} catch (e) {
		return res.status(400).json({ error: e });
	}
	try {
		let expense = await expenses.getExpenseById(expenseId);
		return res.status(200).json({ expense: expense });
	} catch (e) {
		return res.status(404).json({ error: e });
	}
});

// GET: get all expenses for a given goalId.
router.route('/:userId/:goalId/expense').get(async (req, res) => {
	// Validate the ids.
	let userId = req.params.userId;
	let goalId = req.params.goalId;
	try {
		userId = validate.validId(userId);
		goalId = validate.validId(goalId);
	} catch (e) {
		return res.status(400).json({ error: e });
	}
	try {
		let expensesArray = await expenses.getExpensesByGoalId(goalId);
		return res.status(200).json({ expenses: expensesArray });
	} catch (e) {
		return res.status(404).json({ error: e });
	}
});

// POST: create a new expense for a goal.
router.route('/:userId/:goalId/expense').post(async (req, res) => {
	// Validate the ids.
	let userId = req.params.userId;
	let goalId = req.params.goalId;
	let description = req.body.description;
	let amount = req.body.amount;
	let date = req.body.date;
	try {
		userId = validate.validId(userId);
		goalId = validate.validId(goalId);
		description = validate.stringChecker(description);
		amount = validate.limitChecker(amount);
		date = validate.goalDateChecker(date);
	} catch (e) {
		return res.status(400).json({ error: e });
	}
	try {
		let expense = await expenses.addExpense(goalId, description, amount, date);
		return res.status(200).json({ expense: expense });
	} catch (e) {
		return res.status(404).json({ error: e });
	}
});

// PUT: update an expense.
router.route('/:userId/:goalId/:expenseId').put(async (req, res) => {
	// Validate the ids.
	let userId = req.params.userId;
	let goalId = req.params.goalId;
	let expenseId = req.params.expenseId;
	let description = req.body.description;
	let amount = req.body.amount;
	let date = req.body.date;
	try {
		userId = validate.validId(userId);
		goalId = validate.validId(goalId);
		expenseId = validate.validId(expenseId);
		description = validate.stringChecker(description);
		amount = validate.limitChecker(amount);
		date = validate.goalDateChecker(date);
	} catch (e) {
		return res.status(400).json({ error: e });
	}
	try {
		let expense = await expenses.editExpense(expenseId, description, amount, date);
		return res.status(200).json({ expense: expense });
	} catch (e) {
		return res.status(404).json({ error: e });
	}
});

export default router;
