// register, login, editUser, getUser, getFeed, getHistory
import {users, goals} from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import { getGoalsByUserId } from './goals.js';
import {getAllFriends} from './friends.js';
import * as helper from "../../validation.js"
import bcrypt from 'bcrypt';
const saltRounds = 2;

const register = async (fire_id, displayName, username, password, age) => {
    if (!displayName || !username || !password || !age) {
      throw 'All input fields must be provided :: register';
    }

    if (Number.isNaN(age) || age < 13) {
        throw 'Too young to make account :: register';
    }
  
    displayName = helper.checkName(displayName, "display name");
    username = helper.checkName(username, "username");
    password = helper.checkPassword(password);

    const userCollection = await users();
    const user = await userCollection.findOne({username: username});
    if (user != null) {
      throw `User already exists with this username :: register`;
    }
  
    const hash = await bcrypt.hash(password, saltRounds);
  
    //actually insert
    let newUser = {
        fire_id,
        displayName,
        username, 
        password: hash,
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

const login = async (username, password) => {
    if (!username || !password) {
        throw 'All input fields must be provided :: login';
    }

    username = helper.checkName(username, "username");
    password = helper.checkPassword(password);

    const userCollection = await users();
    const user = await userCollection.findOne({username: username});
    if (user === null) {
        throw `Either the username or password is invalid :: login`;
    }
    else {
        let same = await bcrypt.compare(password, user.password);
        if (same) {
            return user;
        }
        else {
            throw `Either the email address or password is invalid :: login`;
        }
    }
}

const editUserInfo = async (userId, displayName, username, password) => {
    if (!displayName || !username || !password) {
        throw 'All input fields must be provided :: editUserInfo';
    }
    
    // if (Number.isNaN(age) || age < 13) {
    //     throw 'Too young to make account :: editUserInfo';
    // }
  
    displayName = helper.checkName(displayName, "display name");
    username = helper.checkName(username, "username");
    password = helper.checkPassword(password);
    const hash = await bcrypt.hash(password, saltRounds);

    const userCollection = await users();
    const currentUser = await userCollection.findOne({_id: new ObjectId(userId)});
    // console.log(currentUser)
    //now do the update
    const updatedUser = {
        displayName,
        username, 
        password: hash,
        friends: currentUser.friends,
        pendingFriends: currentUser.pendingFriends,
        incomingFriends: currentUser.incomingFriends,
        history: currentUser.history,
        categories: currentUser.categories,
        goals: currentUser.goals
    };
    
    // console.log(userId)
    const updatedInfo = await userCollection.findOneAndUpdate(
        {_id: new ObjectId(userId)},
        {$set: updatedUser},
        {returnDocument: 'after'}
    );
    // console.log(updatedInfo)
    if (updatedInfo === null) {
        throw 'Could not update user successfully :: editUserInfo';
    }
    return updatedInfo;
}

const getUser = async (id) => {
    if(!id) throw `Id is required: getUser`
    if(!ObjectId.isValid(id)) throw `Invalid id: getUser`;

    const userCollection = await users();
    let user = await userCollection.findOne({_id: new ObjectId(id)});
    if (user)
    {
        user._id = user._id.toString();
        return user;
    }
    else
        throw "User not found: getUser";
};

const getUserByFireId = async (fire_id) => {
    if(!fire_id) throw `fireId is required: getUser`

    const userCollection = await users();
    let user = await userCollection.findOne({fire_id: fire_id});
    if (user)
    {
        user._id = user._id.toString();
        return user;
    }
    else
        throw "User not found: getUser";
}

const getUserByUsername = async (username) => {
    if(!username) throw `username is required: getUser`

    const userCollection = await users();
    let user = await userCollection.findOne({username: username});
    if (user)
    {
        user._id = user._id.toString();
        return user;
    }
    else
        throw "User not found: getUser";
}

const getFeed = async (id) => {
    //validations
    if(!id) throw `Id is required: getFeed`
    if(!ObjectId.isValid(id)) throw `Invalid id: getFeed`;
    //get friends list
    let friends = await getAllFriends(id);//expects list of friends' IDs
    //iterate and get each friend object
    let goalListFeed = [];
    for (let i=0;i<friends.length;i++)
    {
        let friendId = friends[i];
        let goals = await getGoalsByUserId(friendId);
        for (let j=0;j<goals.length;j++)
        {
            let goal = goals[j];
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
    //currently calls updateHistory which returns latest data
    let updatedHistory = await updateHistory(id);
    return updatedHistory;
    /*
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
        if (helper.dateIsInThePast(goal.goalDate))
        {
            pastHistory.push(goal);
        }
    }
    return pastHistory;
    */
};
const updateHistory = async (id) => {
    //basically getGoalsByUserId but the goals date is past, then updates the user's history field

    //check to see that the id is valid
    if(!id) throw `Id is required: updateHistory`
    if(!ObjectId.isValid(id)) throw `Invalid GoalId: updateHistory`;

    //get the user
    const userCollection = await users();
    let user = await userCollection.findOne({_id: new ObjectId(id)});
    if(user === null) throw `No user exists: updateHistory`;

    //add the goal objects to a goal array
    let pastGoalsArr = [];

    const goalCollection = await goals();
    let allGoals = await goalCollection.find().toArray({});
    for(let i = 0; i < allGoals.length; i++){
        if((allGoals[i].userId).toString() === id.toString() && helper.dateIsInThePast(allGoals[i].goalDate)){
            pastGoalsArr.push(allGoals[i])
        }
    }
    let updateInfo = await userCollection.updateOne(
		{ _id: new ObjectId(id) },
		{ $set: { history: pastGoalsArr } },
		{ returnDocument: 'after' }
	);
	if (updateInfo.modifiedCount === 0) throw 'Couldn\'t update history: updateHistory';

    return pastGoalsArr;
};
export { register, login, editUserInfo, getUser, getFeed, getHistory, updateHistory, getUserByFireId, getUserByUsername }
