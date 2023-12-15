// console.log('Implement me!');
import {
	register,
	editUserInfo,
	getUser,
	getFeed,
	getHistory,
	updateHistory,
	addCategory,
	removeCategory
} from '../data/users.js';
import {
	addGoal,
	deleteGoal,
	getAllGoals,
	getGoalById,
	getGoalsByUserId,
	likePost,
	updateGoal,
	removeFromLikesList
} from '../data/goals.js';
import {
	getExpenseById,
	getExpensesByGoalId,
	addExpense,
	delExpense,
	editExpense,
} from '../data/expenses.js';
import {
	sendFriendRequest,
	acceptRequest,
	declineRequest,
	cancelRequest,
	removeFriend,
	getPendingRequests,
	getIncomingRequests,
	getAllFriends,
} from '../data/friends.js';

import { dbConnection, closeConnection } from '../config/mongoConnection.js';

const db = await dbConnection();
// await db.dropDatabase();

let user1 = undefined;
let user2 = undefined;
let user3 = undefined;
let goal1 = undefined;
let goal2 = undefined;

try {
	user1 = await register('9MporPAh6yMXcgEWaR8u1e5qfxx1', 'IsabellaStone', 'ibellarose1', 'ibellarose1@outlook.com', 21);
	console.log(user1);
} catch (e) {
	console.log(e);
}

try {
	let newUser1 = await editUserInfo(user1._id, 'BellaStone', 'ibellarose1', 21);
	console.log(newUser1);
} catch (e) {
	console.log(e);
}
try {
	user2 = await register('H2L2xyEKplg0K5ice7MtY7oUeWY2','MeganSanford', 'megxxsan', 'megxxsan@outlook.com', 21);
	console.log(user2);
} catch (e) {
	console.log(e);
}
try {
	user3 = await register('NDq0DvRO1cXAw4Qwv8AOQtUSvd73','JacobRose', 'jrose0116', 'jrose0116@gmail.com', 21);
	console.log(user3);
} catch (e) {
	console.log(e);
}

try {
	goal1 = await addGoal(
		user1.fire_id,
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
		user2.fire_id,
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
	console.log(await getGoalsByUserId(user1.fire_id));
} catch (e) {
	console.log(e);
}
try {
	console.log("Getting Megan's Goals");
	console.log(await getGoalsByUserId(user2.fire_id));
} catch (e) {
	console.log(e);
}

try {
	console.log('likes should be 1');
	console.log(await likePost(user1.fire_id, goal2._id));
} catch (e) {
	console.log(e);
}
try {
	console.log('likes should be 0');
	console.log(await likePost(user1.fire_id, goal2._id));
} catch (e) {
	console.log(e);
}

try {
	console.log(
		await updateGoal(
			goal2._id,
			user2.fire_id,
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
		user1.fire_id,
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

let goal4 = undefined;
try {
	goal4 = await addGoal(
		user1.fire_id,
		'Movie Limitation',
		'I want to spend $25 a week on movies',
		'entertainment',
		25,
		'01/30/2024',
		true
	);
	console.log(goal4);
} catch (e) {
	console.log(e);
}

let goal5 = undefined;
try {
	goal5 = await addGoal(
		user2.fire_id,
		'Bar Hopping',
		'I want to spend $40 a week when going to bars',
		'entertainment',
		40,
		'02/25/2024',
		true
	);
	console.log(goal4);
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

let expense2 = undefined;
try {
	expense2 = await addExpense(goal3._id, 'I bought another sandwich', 5.0, '12/18/2023');
	console.log(expense2);
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

// Get an expense by its ID.
try {
	let expenseById = await getExpenseById(expense1._id);
	console.log('----------------HERE-----------------');
	console.log(expenseById);
} catch (e) {
	console.log(e);
}

// Get all expenses by goal Id
try {
	let expensesByGoalId = await getExpensesByGoalId(goal3._id);
	console.log('----------------EXPESNSE BY GOAL ID-----------------');
	console.log(expensesByGoalId);
	console.log('---------------------------------');
} catch (e) {
	console.log(e);
}

// try {
//     let check = await checkUser("IBellaROse1@gmAil.cOM   ", "Iii9iw*u");
//     console.log(check);
// } catch (e) {
//     console.log(e);
// }

try {
	let hist1;
	if (user1) {
		hist1 = await getHistory(user1._id.toString());
	}
	console.log(hist1);
} catch (e) {
	console.log(e);
}
try {
	let hist2;
	if (user2)
	{
		hist2 = await getHistory(user2.fire_id.toString());
	}
	console.log(hist2);
} catch (e) {
	console.log(e);
}

try {
	let sent1, received1;
	if (user1 && user2)
	{
		sent1 = await sendFriendRequest(user1.fire_id.toString(),user2.fire_id.toString());
		console.log(sent1);
		received1 = await acceptRequest(user2.fire_id.toString(),user1.fire_id.toString());
		console.log(received1);
		await likePost(user2.fire_id.toString(),goal3._id.toString());
		await likePost(user2.fire_id.toString(),goal4._id.toString());
		await likePost(user1.fire_id.toString(),goal2._id.toString());
		if (user3)
		{
			await likePost(user3.fire_id.toString(),goal3._id.toString());
			await likePost(user3.fire_id.toString(),goal2._id.toString());
		}
	}
}
catch (e)
{
	console.log(e);
}

try {
	let sent2, incoming2;
	if (user1 && user2 && user3)
	{
		sent2 = await sendFriendRequest(user3.fire_id.toString(),user1.fire_id.toString());
		console.log(sent2);
		incoming2 = await sendFriendRequest(user2.fire_id.toString(),user3.fire_id.toString());
		console.log(incoming2);
	}
}
catch (e)
{
	console.log(e);
}

try {
	console.log(
		await updateGoal(
			goal4._id,
			user1.fire_id,
			'Now Successful 2',
			'This is new 2',
			goal4.category,
			goal4.limit,
			"12/3/2023",// past date needed for history
			true,
			goal4.expenses,
			goal4.likes,
			true
		)
	);
} catch (e) {
	console.log(e);
}
try {
	let hist2 = await getHistory(user2.fire_id)

    console.log(hist2);
} catch (e) {
    console.log(e);
}

try {
	console.log("getFeed: ")
	let feed1 = await getFeed(user2.fire_id.toString());
    console.log(feed1);
} catch (e) {
	console.log(e);
}

try {
	// let removeFromLikesList1 = await removeFromLikesList(user2.fire_id.toString(),user1.fire_id.toString());
	let unfriend = await removeFriend(user2.fire_id.toString(),user1.fire_id.toString());
	console.log(unfriend);
} catch (e) {
	console.log(e);
}

try {
	await addCategory(user2.fire_id.toString(), "testing");
	await addCategory(user2.fire_id.toString(), "chicken");
	await addCategory(user2.fire_id.toString(), "sushi");
	let removalCat = await removeCategory(user2.fire_id.toString(), "testing");
	let removalCat2 = await removeCategory(user2.fire_id.toString(), "sushi     ");
	console.log(removalCat);
	console.log(removalCat2);

} catch (e) {
	console.log(e);
}

await closeConnection();
console.log('\nDone seeding!');
