// console.log('Implement me!');
import { register, login, editUserInfo, getUser, getFeed, getHistory } from '../data/users.js';
import {
	addGoal,
	deleteGoal,
	getAllGoals,
	getGoalById,
	getGoalsByUserId,
	likePost,
	updateGoal,
} from '../data/goals.js';
import {
	getExpenseById,
	getExpensesByGoalId,
	addExpense,
	delExpense,
	editExpense,
} from '../data/expenses.js';
import { dbConnection, closeConnection } from '../config/mongoConnection.js';

const db = await dbConnection();
await db.dropDatabase();

let user1 = undefined;
let user2 = undefined;
let goal1 = undefined;
let goal2 = undefined;

try {
	user1 = await register('IsabellaStone', 'ibellarose1', 'Password123!', 21);
	console.log(user1);
} catch (e) {
	console.log(e);
}
try {
	let signedIn = await login('ibelLArose1 ', 'Password123!');
	console.log('succesfully logged in user 1');
} catch (e) {
	console.log(e);
}
try {
	// let failedSignIn  = await login("ibellarose1", "Paord123!"); //wrong password
	let failedSignIn = await login('iblarose1', 'Password123!'); //wrong username
} catch (e) {
	console.log('successfully FAILED to sign in user 1');
}
try {
	user1 = await editUserInfo('BellaStone', 'ibellarose1', 'Password123!', 21); //can't edit username
	console.log(user1);
} catch (e) {
	console.log(e);
}
try {
	user2 = await register('MeganSanford', 'megxxsan', 'Abc123!!', 21);
	console.log(user2);
} catch (e) {
	console.log(e);
}

try {
	goal1 = await addGoal(
		user1._id,
		'Rent',
		'I want to pay $2000 a month for rent',
		'utilities',
		2000,
		'12/12/2023'
	);
	console.log(goal1);
} catch (e) {
	console.log(e);
}
try {
	goal2 = await addGoal(
		user2._id,
		'Groceries',
		'I want to spend $100 a week on groceries',
		'food',
		100,
		'12/20/2023'
	);
	console.log(goal2);
} catch (e) {
	console.log(e);
}
try {
	console.log('************************************************');
	console.log(await getAllGoals());
} catch (e) {
	console.log(e);
}

try {
	console.log(await getGoalById(goal1._id));
} catch (e) {
	console.log(e);
}

try {
	console.log(await deleteGoal(goal1._id));
	console.log(user1);
} catch (e) {
	console.log(e);
}

try {
	console.log("Getting Isabella's Goals");
	console.log(await getGoalsByUserId(user1._id));
} catch (e) {
	console.log(e);
}
try {
	console.log("Getting Megan's Goals");
	console.log(await getGoalsByUserId(user2._id));
} catch (e) {
	console.log(e);
}

try {
	console.log('likes should be 1');
	console.log(await likePost(user1._id, goal2._id));
} catch (e) {
	console.log(e);
}
try {
	console.log('likes should be 0');
	console.log(await likePost(user1._id, goal2._id));
} catch (e) {
	console.log(e);
}

try {
	console.log(
		await updateGoal(
			goal2._id,
			user2._id,
			'New Title',
			'This is new',
			goal2.category,
			goal2.limit,
			goal2.goalDate,
			goal2.successful,
			goal2.expenses,
			goal2.likes
		)
	);
} catch (e) {
	console.log(e);
}

let goal3 = undefined;
try {
	goal3 = await addGoal(
		user1._id,
		'Groceries',
		'I want to spend $100 a week on groceries',
		'food',
		100,
		'12/20/2023'
	);
	console.log(goal3);
} catch (e) {
	console.log(e);
}

let expense1 = undefined;
try {
	expense1 = await addExpense(goal3._id, 'I bought a sandwich', 5.0, '12/18/2023');
	console.log(expense1);
} catch (e) {
	console.log(e);
}

// let delExpense1 = undefined;
// try {
// 	delExpense1 = await delExpense(expense1._id);
// 	console.log(delExpense);
// } catch (e) {
// 	console.log(e);
// }

try {
	await editExpense(expense1._id, 'UPDATED.', 4.0, '12/14/2023');
} catch (e) {
	console.log(e);
}

// try {
//     let check = await checkUser("IBellaROse1@gmAil.cOM   ", "Iii9iw*u");
//     console.log(check);
// } catch (e) {
//     console.log(e);
// }

await closeConnection();
console.log('\nDone seeding!');
