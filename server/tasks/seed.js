// console.log('Implement me!');
import { register } from "../data/users.js";
import { addGoal, deleteGoal, getAllGoals, getGoalById, getGoalsByUserId, likePost } from "../data/goals.js";
import {dbConnection, closeConnection} from '../config/mongoConnection.js';

const db = await dbConnection();
await db.dropDatabase();

let user1 = undefined;
let user2 = undefined;
let goal1 = undefined;
let goal2 = undefined;

try {
    user1 = await register("Isabella Stone", "ibellarose1", "Password123!", 21);
    console.log(user1);
} catch (e) {
    console.log(e);
}
try {
    user2 = await register("Megan Sanford", "megxsan", "Abc123!!", 21);
    console.log(user2);
} catch (e) {
    console.log(e);
}
try{
    goal1= await addGoal(user1._id, "Rent", "I want to pay $2000 a month for rent", "utilities", 2000, "12/12/2023")
    console.log(goal1);
}catch(e){
    console.log(e);
}
try{
    goal2 = await addGoal(user2._id, "Groceries", "I want to spend $100 a week on groceries", "food", 100, "11/20/2023");
    console.log(goal2);
}catch(e){
    console.log(e);
}
try{
    console.log("************************************************")
    console.log(await getAllGoals());

}catch(e){
    console.log(e);
}

try{
    console.log(await getGoalById(goal1._id))
}catch(e){
    console.log(e)
}

try{
    console.log(await deleteGoal(goal1._id));
    console.log(user1)
}catch(e){
    console.log(e);
}

try{
    console.log("Getting Isabella's Goals")
    console.log(await getGoalsByUserId(user1._id));
}catch(e){
    console.log(e)
}
try{
    console.log("Getting Megan's Goals")
    console.log(await getGoalsByUserId(user2._id));
}catch(e){
    console.log(e)
}

try{
    console.log("likes should be 1")
    console.log(await likePost(user1._id, goal2._id))
}catch(e){
    console.log(e);
}
try{
    console.log("likes should be 0")
    console.log(await likePost(user1._id, goal2._id))
}catch(e){
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