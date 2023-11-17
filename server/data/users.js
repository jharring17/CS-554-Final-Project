// register, login, delete, editUser, getUser, getFeed, getHistory
import {users, goals} from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import { getGoalsByUserId } from './goals.js';
import * as helper from "../../validation.js"
import bcrypt from 'bcrypt';
const saltRounds = 2;

const register = async (displayName, username, password, age) => {

    if (!displayName || !username || !password || !age) {
      throw 'All input fields must be provided :: register';
    }

    if (age < 13) {
        throw 'Too young to make account :: register';
    }
  
    // firstName = checkName(firstName, "First name");
    // lastName = checkName(lastName, "Last name");
  
    const userCollection = await users();
    const user = await userCollection.findOne({username: username});
    if (user != null) {
      throw `User already exists with this username :: register`;
    }
  
    password = helper.checkPassword(password);
    const hash = await bcrypt.hash(password, saltRounds);
  
    //actually insert
    let newUser = {
        displayName,
        username, 
        password,
        friends: [],
        pendingFriends: [],
        incomingFriends: [],
        history: [],
        categories: ["food", "utilities", "entertainment"],
        goals: []

    };
    const insertInfo = await userCollection.insertOne(newUser); 
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
      throw 'Could not add user :: register';
    }
    return newUser;
}

const getUser = async (id) => {
    if(!id) throw `Id is required: getUser`
    if(!ObjectId.isValid(id)) throw `Invalid id: getUser`;

    const userCollection = await users();
    let user = userCollection.findOne({_id: new ObjectId(id)});
    if (user)
        return user;
    else
        throw "User not found: getUser";
};
const getFeed = async (id) => {
    //validations 
    if(!id) throw `Id is required: getFeed`
    if(!ObjectId.isValid(id)) throw `Invalid id: getFeed`;
    //get friends list
    let friends = await getAllFriends(id);//expects list of friends' IDs

    //iterate and get each friend object
    let goalListFeed = [];
    for (let friendId in friends)
    {
        //gets goals of a user
        let goals = await getGoalsByUserId(friendId);
        for (let goal in goals)
        {
            //add to list iff goal is successful and goalDate within 7 days
            if (goal.successful == true && helper.dateWithin7Days(goal.goalDate))
            {
                goalListFeed.push(goal);
            }
        }
    }
    return goalListFeed;
};
const getHistory = async (id) => {
    if(!id) throw `Id is required: getHistory`
    if(!ObjectId.isValid(id)) throw `Invalid id: getHistory`;

    let userHistory = undefined;
    try {
        let user = await getUser(id);
        userHistory = user.history;
    }
    catch (e)
    {
        throw "User not found: getHistory";
    }
    let pastHistory = [];
    for (let goal in userHistory)
    {
        //add to list iff goalDate is past
        if (helper.dateWithin7Days(goal.goalDate))
        {
            pastHistory.push(goal);
        }
    }
    return pastHistory;
};
export { register, getUser, getFeed, getHistory }
