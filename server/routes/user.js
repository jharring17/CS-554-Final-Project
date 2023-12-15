import * as goals from "../data/goals.js";
import * as users from "../data/users.js";
import * as expenses from "../data/expenses.js";
import * as validate from "../../validation.js";
import { Router } from "express";
const router = Router();
import redis from 'redis';
const client = redis.createClient();
client.connect().then(()=>{})

router.route("/:userId/getUserInfo").get(async (req, res) => {
	//validate the id
	let id = req.params.userId;

	// let stored = await client.exists(`friend-${id}`);
	// if(stored){
	// 	console.log("friend data was in cache");
	// 	let friendPageInfo = await client.get(`friend-${id}`);
	// 	friendPageInfo = JSON.parse(friendPageInfo);
	// 	return res.status(200).json(friendPageInfo)
	//}else{
		// console.log("friend data was not in cache")
		try {
			let data = await users.getUser(id);
			// let asString = JSON.stringify(data);
			// let addedToCache = await client.setEx(`friend-${id}`, 3600, asString);
			return res.status(200).json(data);
		} catch (e) {
			return res.status(404).json({ error: e });
		}
	//}

});

router.route("/:userId/getFriendInfo").get(async (req, res) => {
	//validate the id
	let id = req.params.userId;

	let stored = await client.exists(`friend-${id}`);
	if(stored){
		console.log("friend data was in cache");
		let friendPageInfo = await client.get(`friend-${id}`);
		friendPageInfo = JSON.parse(friendPageInfo);
		return res.status(200).json(friendPageInfo)
	}else{
		console.log("friend data was not in cache")
		try {
			let data = await users.getUser(id);
			let asString = JSON.stringify(data);
			let addedToCache = await client.setEx(`friend-${id}`, 3600, asString);
			return res.status(200).json(data);
		} catch (e) {
			return res.status(404).json({ error: e });
		}
	}
})

router.route("/register").post(async (req, res) => {
	let fire_id = req.body.fire_id;
	let displayName = req.body.displayName;
	let username = req.body.username;
	let email = req.body.email;
	let age = req.body.age;

	//error check inputs
	try {
		fire_id = validate.checkFireId(fire_id);
		username = validate.checkName(username, "username");
		email = validate.checkEmail(email);
		age = validate.checkAge(age);
	} catch (e) {
		console.log(e);
		return res.status(401).json({ error: e });
	}

	try {
		let newUser = await users.register(
			fire_id,
			displayName,
			username,
			email,
			age
		);
		return res.status(200).json(newUser);
	} catch (e) {
		console.log(e);
		return res.status(500).json({ error: e });
	}
});

router.route("/:userId/feed").get(async (req, res) => {
	//validate the id
	let id = req.params.userId;
	try {
		id = validate.checkFireId(id);
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

router.route("/:userId/:goalId/like").post(async (req, res) => {
	//validate the ids
	let userId = req.params.userId;
	let goalId = req.params.goalId;
	try {
		userId = validate.checkFireId(userId);
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
router.route("/:userId/:goalId/:expenseId").get(async (req, res) => {
	// Validate the ids.
	let userId = req.params.userId;
	let goalId = req.params.goalId;
	let expenseId = req.params.expenseId;
	try {
		userId = validate.checkFireId(userId);
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
router.route("/:userId/:goalId").get(async (req, res) => {
	// Validate the ids.
	let userId = req.params.userId;
	let goalId = req.params.goalId;
	try {
		userId = validate.checkFireId(userId);
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
router.route("/:userId/:goalId").post(async (req, res) => {
	// Validate the ids.
	let userId = req.params.userId;
	let goalId = req.params.goalId;
	let description = req.body.description;
	let amount = req.body.amount;
	let date = req.body.date;
	try {
		userId = validate.checkFireId(userId);
		goalId = validate.validId(goalId);
		description = validate.stringChecker(description);
		amount = validate.limitChecker(amount);
		date = validate.expenseDateChecker(date);
	} catch (e) {
		return res.status(400).json({ error: e });
	}
	try {
		let expense = await expenses.addExpense(goalId, description, amount, date);
		let remove = await client.del(`goals-for-user-${userId}`)
		return res.status(200).json({ expense: expense });
	} catch (e) {
		return res.status(404).json({ error: e });
	}
});

// PUT: update an expense.
router.route("/:userId/:goalId/:expenseId").put(async (req, res) => {
	// Validate the ids.
	let userId = req.params.userId;
	let goalId = req.params.goalId;
	let expenseId = req.params.expenseId;
	let description = req.body.description;
	let amount = req.body.amount;
	let date = req.body.date;
	try {
		userId = validate.checkFireId(userId);
		goalId = validate.validId(goalId);
		expenseId = validate.validId(expenseId);
		description = validate.stringChecker(description);
		amount = validate.limitChecker(amount);
		date = validate.expenseDateChecker(date);
	} catch (e) {
		return res.status(400).json({ error: e });
	}
	try {
		let expense = await expenses.editExpense(
			expenseId,
			description,
			amount,
			date
		);
		console.log(expense)
		return res.status(200).json({ expense: expense });
	} catch (e) {
		return res.status(404).json({ error: e });
	}
});

// DELETE: delete an expense.
router.route("/:userId/:goalId/:expenseId").delete(async (req, res) => {
	// Gather the input parameters.
	let userId = req.params.userId;
	let goalId = req.params.goalId;
	let expenseId = req.params.expenseId;
	try {
		// Validate the input parameters.
		userId = validate.checkFireId(userId);
		goalId = validate.validId(goalId);
		expenseId = validate.validId(expenseId);

		// Check that the user owns the goal.
		let goal = await goals.getGoalById(goalId);
		if (goal.userId.toString() !== userId.toString())
			throw `Error: User does not own this goal.`;
	} catch (e) {
		return res.status(400).json({ error: e });
	}
	// Delete the expense.
	try {
		let expense = await expenses.delExpense(expenseId);
		return res.status(200).json({ expense: expense });
	} catch (e) {
		return res.status(404).json({ error: e });
	}
});

// PUT: update an expense.
router.route("/:userId/:goalId/:expenseId").put(async (req, res) => {
	// Gather the input parameters.
	let userId = req.params.userId;
	let goalId = req.params.goalId;
	let expenseId = req.params.expenseId;
	let description = req.body.description;
	let amount = req.body.amount;
	let date = req.body.date;
	try {
		// Validate the input parameters.
		userId = validate.checkFireId(userId);
		goalId = validate.validId(goalId);
		expenseId = validate.validId(expenseId);
		description = validate.stringChecker(description);
		amount = validate.limitChecker(amount);
		date = validate.expenseDateChecker(date);

		// Check that the user owns the goal.
		let goal = await goals.getGoalById(goalId);
		if (goal.userId.toString() !== userId.toString())
			throw `Error: User does not own this goal.`;

		// Check that the expense is within the goal.
		let expense = await expenses.getExpenseById(expenseId);
		if (expense.goalId.toString() !== goalId.toString())
			throw `Error: Expense is not within the goal.`;
	} catch (e) {
		return res.status(400).json({ error: e });
	}
	// Update the expense.
	try {
		let expense = await expenses.editExpense(
			expenseId,
			description,
			amount,
			date
		);
		return res.status(200).json({ expense: expense });
	} catch (e) {
		return res.status(404).json({ error: e });
	}
});

router.route("/:userId/addCategory").post(async (req, res) => {
	//validate the ids
	let fire_id = req.body.fire_id;
	let category = req.body.category;
	try {
		fire_id = validate.checkFireId(fire_id);
		category = validate.checkCategory(category);
		// ensure cannot add duplicate category here:
	} catch (e) {
		console.log(e);
		return res.status(400).json({ error: e });
	}
	try {
		let updatedCategories = await users.addCategory(fire_id, category);
		await client.del(`goals-for-user-${fire_id}`)
		return res.status(200).json(updatedCategories);
	} catch (e) {
		console.log(e);
		return res.status(500).json({ error: e });
	}
});

export default router;
