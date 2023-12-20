import * as goals from "../data/goals.js";
import * as users from "../data/users.js";
import * as expenses from "../data/expenses.js";
import * as validate from "../../validation.js";
import {isValid, parse, isBefore, startOfDay} from 'date-fns'
import { Router } from "express";
const router = Router();
import redis from 'redis';
const client = redis.createClient();
client.connect().then(()=>{})

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
		return res.status(400).json({ error: e });
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
		return res.status(400).json({ e });
	}
});


router.route("/:userId/checkUsernameExists").get(async (req, res) => {
	//validate the id
	let id = req.params.userId;
		try {
			let bool = await users.usernameExists(id);
			return res.status(200).json(bool);
		} 
		catch (e) {
			return res.status(400).json({ error: e });
		}
});

router.route("/:userId/getUserInfo").get(async (req, res) => {
	//validate the id
	let id = req.params.userId;
		try {
			let data = await users.getUser(id);
			return res.status(200).json(data);
		} catch (e) {
			return res.status(404).json({ error: e });
		}
});

router.route("/:userId/addCategory").post(async (req, res) => {
	//validate the ids
	let fire_id = req.body.fire_id;
	let category = req.body.category;//might need to be req.params.userId
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
		return res.status(400).json({ error: e });
	}
});

router.route("/:userId/removeCategory").post(async (req, res) => {
	//validate the ids
	console.log(req.body)
	console.log('params', req.params)
	let fire_id = req.params.userId;
	let category = req.body.category;
	// console.log(fire_id)
	// console.log(category);
	try {
		fire_id = validate.checkFireId(fire_id);
		category = validate.checkCategory(category);
		if (category == "food" || category == "utilities" || category == "entertainment")
		{
			throw "cannot remove default category"
		}
	} catch (e) {
		console.log(e);
		return res.status(400).json({ error: e });
	}
	try {
		let updatedCategories = await users.removeCategory(fire_id, category);
		await client.del(`goals-for-user-${fire_id}`)
		return res.status(200).json(updatedCategories);
	} catch (e) {
		console.log(e);
		if (e.includes("does not have category"))
		{
			return res.status(404).json({ error: e });
		}
		return res.status(500).json({ error: e });
	}
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
	amount = parseFloat(amount)
	let date = req.body.date;
	try {
		userId = validate.checkFireId(userId);
		goalId = validate.validId(goalId);
		description = validate.stringChecker(description);
		amount = validate.limitChecker(amount);
	} catch (e) {
		return res.status(400).json({ error: e });
	}
	//check all of the date data 
	let split = date.split("/");
	if (split.length != 3 || split[0].length !== 2 || split[1].length !== 2 || split[2].length != 4) {
		return res.status(400).json({ error: "Date must be in the form MM/DD/YYYY" });
	}
	let parsedDate = parse(date, 'MM/dd/yyyy', new Date());

	if (!isValid(parsedDate)) {
		return res.status(400).json({ error: "Date must be a valid date"});
	}
	if (isBefore(startOfDay(new Date()), parsedDate)) {
		return res.status(400).json({ error: "Date must be today's date or a past date"});
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
	amount = parseFloat(amount)
	let date = req.body.date;
	try {
		userId = validate.checkFireId(userId);
		goalId = validate.validId(goalId);
		expenseId = validate.validId(expenseId);
		description = validate.stringChecker(description);
		amount = validate.limitChecker(amount);
	} catch (e) {
		return res.status(400).json({ error: e });
	}
	//check all of the date data 
	let split = date.split("/");
	if (split.length != 3 || split[0].length !== 2 || split[1].length !== 2 || split[2].length != 4) {
		return res.status(400).json({ error: "Date must be in the form MM/DD/YYYY" });
	}
	let parsedDate = parse(date, 'MM/dd/yyyy', new Date());

	if (!isValid(parsedDate)) {
		return res.status(400).json({ error: "Date must be a valid date"});
	}
	if (isBefore(startOfDay(new Date()), parsedDate)) {
		return res.status(400).json({ error: "Date must be today's date or a past date"});
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

export default router;
