import {users, goals} from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import * as helper from "../../validation.js"

const addGoal = async (
    userId,
    title,
    description,
    category,
    limit,
    goalDate,
    seedingBool //optional: true for seeding past dates (needed for history/feed), false or undefined otherwise
) => {

    //check that all inputs are provided
    if(!userId) throw `UserId is required: addGoal`;
    if(!title) throw `Title is required: addGoal`;
    if(!description) throw `Description is required: addGoal`;
    if(!category) throw `Category is required: addGoal`;
    if(!goalDate) throw `UserId is required: addGoal`;

    //check to see that the userId is valid
    //NEED TO FIGURE OUT HOW TO VALIDATE THE USERID
    // if(!ObjectId.isValid(userId)) throw `Invalid UserId: addGoal`;

    //check to see that inputs are valid strings
    userId = helper.checkFireId(userId);
    title = helper.checkGoalTitle(title);
    description = helper.checkGoalDesc(description);
    category = helper.stringChecker(category);
    goalDate = helper.stringChecker(goalDate); 

    //check to see if the limit is a float
    limit = helper.limitChecker(limit);

    //make sure that the category is a valid category for the user
    category = await helper.categoryChecker(userId, category)

    //make sure date is in the format mm/dd/yyyy
    if (!seedingBool)
    {
        goalDate = helper.goalDateChecker(goalDate)
    }

    let newGoal = {
        userId: userId,
        title: title,
        description: description,
        category: category,
        limit: limit,
        goalDate: goalDate,
        successful: false,
        expenses: [],
        likes: []
      }

    // add the band to the database
    const goalCollection = await goals();
    let inserted = await goalCollection.insertOne(newGoal);
    if(!inserted.acknowledged || !inserted.insertedId){
        throw `Couldn't add goal: addGoal`;
    }

    //now that we have a new goal, we want to add the id to the user
    const userCollection = await users();
    // let user = await userCollection.findOne({_id: new ObjectId(userId)});
    let user = await userCollection.findOne({fire_id: userId});
    let goalsList = user.goals;
    goalsList.push(inserted.insertedId.toString());
    let updated = {
        displayName: user.displayName,
        username: user.username,
        password: user.password,
        friends: user.friends,
        pendingFriends: user.pendingFriends,
        incomingFriends: user.incomingFriends,
        history: user.history,
        categories: user.categories,
        goals: goalsList
    }
    // const updatedUser = await userCollection.findOneAndUpdate({_id: new ObjectId(userId)}, {$set: updated}, {returnDocument: "after"});
    const updatedUser = await userCollection.findOneAndUpdate({fire_id: userId}, {$set: updated}, {returnDocument: "after"});

    return newGoal;
};

const deleteGoal = async (id) => {
    //check to see that the id is valid
    if(!id) throw `Id is required: deleteGoal`
    if(!ObjectId.isValid(id)) throw `Invalid GoalId: deleteGoal`;

    const goalCollection = await goals();
    let deleted = await goalCollection.findOneAndDelete({_id: new ObjectId(id)});

    //now that we have deleted a goal, we want to remove the id from the user
    const userCollection = await users();
    let user = await userCollection.findOne({fire_id: deleted.userId});
    let goalsList = user.goals;
    var index = goalsList.indexOf(deleted._id.toString());
    if (index > -1) {
        goalsList.splice(index, 1);
    }
    let updated = {
        displayName: user.displayName,
        username: user.username,
        password: user.password,
        friends: user.friends,
        pendingFriends: user.pendingFriends,
        incomingFriends: user.incomingFriends,
        history: user.history,
        categories: user.categories,
        goals: goalsList
    }
    const updatedUser = await userCollection.findOneAndUpdate({fire_id: deleted.userId}, {$set: updated}, {returnDocument: "after"});

    //return the goal that was deleted
    return deleted;
};

const updateGoal = async (
    id,
    userId,
    title,
    description,
    category,
    limit,
    goalDate,
    successful,
    expenses, 
    likes,
    seedingBool //optional: true for seeding past dates (needed for history/feed), false or undefined otherwise
) => {

    //check that all inputs are provided
    if(!id) throw `Id is required: updateGoal`;
    if(!userId) throw `UserId is required: updateGoal`;
    if(!title) throw `Title is required: updateGoal`;
    if(!description) throw `Description is required: updateGoal`;
    if(!category) throw `Category is required: updateGoal`;
    if(!limit) throw 'Limit is required: updateGoal';
    if(!goalDate) throw `UserId is required: updateGoal`;
    if(successful != true && successful != false) throw `Successful is required: updateGoal`;
    if(!expenses) throw `Expenses Array is required: updateGoal`;
    if(!likes) throw `Likes array is required: updateGoal`;

    //check to see that the id is valid
    if(!ObjectId.isValid(id)) throw `Invalid Id: updateGoal`;

    //check to see that inputs are valid strings
    userId = helper.checkFireId(userId);
    title = helper.checkGoalTitle(title);
    description = helper.checkGoalDesc(description);
    category = helper.stringChecker(category);
    goalDate = helper.stringChecker(goalDate); 

    //check to see if the limit is a float
    limit = helper.limitChecker(limit);

    //make sure that the category is a valid category for the user
    category = await helper.categoryChecker(userId, category)

    //make sure date is in the format mm/dd/yyyy
    if (!seedingBool)
    {
        goalDate = helper.goalDateChecker(goalDate)
    }

    //check to make sure successful is a boolean
    successful = helper.isBoolean(successful);

    //check to make sure expenses / likes are arrays of proper ids
    expenses = helper.isIdArray(expenses);
    likes = helper.isFireIdArr(likes);

    //make sure that at least one attribute has changed
    let curr = await getGoalById(id);
    if(userId === curr.userId && title === curr.title && description === curr.description && category === curr.category && goalDate === curr.goalDate && successful === curr.successful && expenses === curr.expenses && likes === curr.likes){
        throw `At least 1 input needs to be different when you update: updateGoal`;
    }
    //now we can replace the goal
    let updated = {
        userId,
        title,
        description,
        category,
        limit,
        goalDate,
        successful,
        expenses, 
        likes
    }

    const goalCollection = await goals();
    const updatedGoal = await goalCollection.findOneAndUpdate({_id: new ObjectId(id)}, {$set: updated}, {returnDocument: "after"});
    return updatedGoal;
};

const getAllGoals = async () => {
    //check to see if I need the user id as a parameter

    const goalCollection = await goals();
    let allGoals = await goalCollection.find().toArray();
    return allGoals;
};

const getGoalById = async (id) => {
    //check to see that the id is valid
    if(!id) throw `Id is required: getGoalById`
    if(!ObjectId.isValid(id)) throw `Invalid GoalId: getGoalById`;

    //get the goal
    const goalCollection = await goals();
    let goal = await goalCollection.findOne({_id: new ObjectId(id)});
    if(goal === null) throw `No goal exists: getGoalById`;
    return goal;
};

const getGoalsByUserId = async (id) => {
    //check to see that the id is valid
    if(!id) throw `Id is required: getGoalsByUserId`
    id = helper.checkFireId(id);

    //get the user
    const userCollection = await users();
    let user = await userCollection.findOne({fire_id: id});

    if(user === null) throw `No user exists: getGoalsByUserId`;

    //add the goal objects to a goal array
    let goalsArr = [];

    const goalCollection = await goals();
    let allGoals = await goalCollection.find().toArray({});
    for(let i = 0; i < allGoals.length; i++){
        if((allGoals[i].userId).toString() === id.toString()){
            goalsArr.push(allGoals[i])
        }
    }
    return goalsArr;
};

const likePost = async (userId, goalId) => {
    //make sure to add the user who liked the picture to the likes array in goal, and users can like/unlike (they can only like once)

    //check to make sure that the ids are valid
    if(!userId) throw `UserId is required: likePost`
    if(!goalId) throw `GoalId is required: likePost`
    if(!ObjectId.isValid(goalId)) throw `Invalid GoalId: likePostGoal`;
    userId = helper.checkFireId(userId);

    //check to make sure that the user and the goal exist 
    let goalCollection = await goals();
    let goal = await goalCollection.findOne({_id: new ObjectId(goalId)});
    if(goal === null) throw `Goal does not exist: likePost`
    let userCollection = await users();
    // let user = await userCollection.findOne({_id: userId});
    let user = await userCollection.findOne({fire_id: userId});
    if(user === null) throw `User does not exist: likePost`;

    if (userId.toString() == goal.userId.toString()) throw `User cannot like their own post: likePost`;
    //now we see if the user has liked the goal or not 
    let liked = false;
    let index;

    for(let i = 0; i < goal.likes.length; i++){
        if((user.fire_id).toString() === (goal.likes[i]).toString()){
            liked = true;
            index = i;
            break;
        }
    }
    if(liked){
        goal.likes.splice(index);
    }else{
        goal.likes.push(userId);
    }
    //now update the overall goal
    let updated = {
        userId: goal.userId,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        limit: goal.limit,
        goalDate: goal.goalDate,
        successful: goal.successful,
        expenses: goal.expenses,
        likes: goal.likes
    }
    const updatedGoal = await goalCollection.findOneAndUpdate({_id: new ObjectId(goalId)}, {$set: updated}, {returnDocument: "after"});
    return updatedGoal;
};

export {addGoal, deleteGoal, updateGoal, getAllGoals, getGoalById, getGoalsByUserId, likePost}