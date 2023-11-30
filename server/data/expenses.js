// getExpenseById, addExpense, delExpense, editExpense
import { goals, expenses } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import * as helper from '../../validation.js';

// Get an expense by its ID.
const getExpenseById = async (expenseId) => {
	// Validate the ID.
	if (!expenseId) throw `Id is required: getExpenseById`;
	if (!ObjectId.isValid(expenseId)) throw `Invalid id: getExpenseById`;

	// Get the expense from expense collection.
	const expenseCollection = await expenses();
	let expense = expenseCollection.findOne({ _id: new ObjectId(expenseId) });

	// Check if an expense was found.
	if (expense) return expense;
	else throw 'Expense not found: getExpenseById';
};

// Get all expenses by goal ID.
const getExpensesByGoalId = async (goalId) => {
	// Validate the ID.
	if (!goalId) throw `Id is required: getExpensesByGoalId`;
	if (!ObjectId.isValid(goalId)) throw `Invalid id: getExpensesByGoalId`;

	// Get the goal from goal collection.
	const goalCollection = await goals();
	let goal = goalCollection.findOne({ _id: new ObjectId(goalId) });

	// Check if a goal was found.
	if (goal) return goal.expenses;
	else throw 'Goal not found: getExpensesByGoalId';
};

//? TEST: update date if needed.
// Add an expense to the database.
const addExpense = async (goalId, description, amount, date) => {
	// Validate the user ID.
	if (!goalId) throw `Goal ID is required: addExpense`;
	if (!ObjectId.isValid(goalId)) throw `Invalid Goal ID: addExpense`;

	// Validate the description.
	description = helper.stringChecker(description);

	// Validate the amount.
	amount = helper.limitChecker(amount);

	// Validate the date.
	date = helper.goalDateChecker(date);
	let goalCollection = await goals();
	let goal = await goalCollection.findOne({ _id: new ObjectId(goalId) });
	console.log(goal);
	let goalDate = Date.parse(goal.goalDate);
	let expenseDate = Date.parse(date);
	if (expenseDate > goalDate) throw `Invalid date entered for expense: addExpense`;

	// Create the expense object.
	let expense = {
		goalId: goalId,
		description: description,
		amount: amount,
		date: date,
	};
	let expenseCollection = await expenses();
	let insertInfo = await expenseCollection.insertOne(expense);
	if (insertInfo.insertedCount === 0) throw 'Could not add expense: addExpense';

	// Add the expenseId to the goal with corresponding goalId.
	let updateInfo = await goalCollection.updateOne(
		{ _id: new ObjectId(goalId) },
		{ $push: { expenses: insertInfo.insertedId } }
	);
	if (updateInfo.modifiedCount === 0) throw 'Could not add expense to goal: addExpense';

	// Return the expense.
	return await getExpenseById(insertInfo.insertedId);
};

//? TEST
// Delete an expense from the database.
const delExpense = async (expenseId) => {
	// Validate the expense ID.
	if (!expenseId) throw `Expense ID is required: delExpense`;
	if (!ObjectId.isValid(expenseId)) throw `Invalid Expense ID: delExpense`;

	// Delete the expense from expense collection.
	const expenseCollection = await expenses();
	let deletedExpense = await getExpenseById(expenseId);
	let deleteInfo = await expenseCollection.deleteOne({ _id: new ObjectId(expenseId) });
	if (deleteInfo.deletedCount === 0) throw 'Could not delete expense: delExpense';

	// Delete the expenseId from the goal with corresponding goalId.
	let goalCollection = await goals();
	let updateInfo = await goalCollection.updateOne(
		{ _id: new ObjectId(deletedExpense.goalId) },
		{ $pull: { expenses: expenseId } }
	);

	// Return the deleted expense.
	return deletedExpense;
};

//? TEST: update date if needed
// Edit an expense in the database.
const editExpense = async (expenseId, description, amount, date) => {
	// Validate the expense ID.
	if (!expenseId) throw `Expense ID is required: editExpense`;
	if (!ObjectId.isValid(expenseId)) throw `Invalid Expense ID: editExpense`;

	// Validate the description.
	description = helper.stringChecker(description);

	// Validate the amount.
	amount = helper.limitChecker(amount);

	// Validate the date.
	date = helper.goalDateChecker(date);
	const expenseCollection = await expenses();
	const goalCollection = await goals();
	let expense = await expenseCollection.findOne({ _id: new ObjectId(expenseId) });
	let goal = await goalCollection.findOne({ _id: new ObjectId(expense.goalId) });
	let expenseDate = Date.parse(date);
	let goalDate = Date.parse(goal.goalDate);
	if (expenseDate > goalDate) throw `Invalid date entered for expense: editExpense`;

	// Update the expense in expense collection.
	let updateInfo = await expenseCollection.updateOne(
		{ _id: new ObjectId(expenseId) },
		{ $set: { description: description, amount: amount, date: date } },
		{ returnDocument: 'after' }
	);

	// Check if an expense was found.
	if (updateInfo.modifiedCount === 0) throw 'Could not update expense: editExpense';

	// Return the updated expense.
	return updateInfo.value;
};

export { getExpenseById, getExpensesByGoalId, addExpense, delExpense, editExpense };
