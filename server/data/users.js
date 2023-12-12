// register, login, editUser, getUser, getFeed, getHistory
import {users, goals} from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import { getGoalsByUserId } from './goals.js';
import {getAllFriends} from './friends.js';
import * as helper from "../../validation.js"
import bcrypt from 'bcrypt';
const saltRounds = 2;

const register = async (fire_id, displayName, username, email, age) => {
    if (!displayName || !username || !email || !age) {
      throw 'All input fields must be provided :: register';
    }
  
    fire_id = helper.checkFireId(fire_id);
    displayName = helper.checkName(displayName, "display name");
    username = helper.checkName(username, "username");
    email = helper.checkEmail(email);
    age = helper.checkAge(age);

    const userCollection = await users();
    const user = await userCollection.findOne({email: email});
    if (user != null) {
      throw `User already exists with this email :: register`;
    }
    
    //actually insert
    let newUser = {
        fire_id,
        displayName,
        username, 
        email,
        age: age,
        friends: [],
        pendingFriends: [],
        incomingFriends: [],
        history: [],
        categories: ["food", "utilities", "entertainment"],
        profilePic: "https://res.cloudinary.com/djllvfvts/image/upload/v1702326218/360_F_553796090_XHrE6R9jwmBJUMo9HKl41hyHJ5gqt9oz_frzcgl.jpg",
        goals: []
    };
    const insertInfo = await userCollection.insertOne(newUser); 
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
      throw 'Could not add user :: register';
    }
    return newUser;
}

// aren't using this anymore
// const login = async (email, password) => {
//     if (!email || !password) {
//         throw 'All input fields must be provided :: login';
//     }

//     email = helper.checkEmail(email);
//     password = helper.checkPassword(password);

//     const userCollection = await users();
//     const user = await userCollection.findOne({email: email});
//     if (user === null) {
//         throw `Either the email or password is invalid :: login`;
//     }
//     else {
//         let same = await bcrypt.compare(password, user.password);
//         if (same) {
//             return user;
//         }
//         else {
//             throw `Either the email address or password is invalid :: login`;
//         }
//     }
// }

const editUserInfo = async (fire_id, displayName, username, email, photo) => {
    if (!displayName || !username || !email) {
        throw 'All input fields must be provided :: editUserInfo';
    }
  
    fire_id = helper.checkFireId(fire_id);
    displayName = helper.checkName(displayName, "display name");
    username = helper.checkName(username, "username");
    email = helper.checkEmail(email);

    const userCollection = await users();
    const currentUser = await userCollection.findOne({fire_id: fire_id});
    // console.log(currentUser)
    //now do the update
    const updatedUser = {
        displayName,
        username, 
        email,
        friends: currentUser.friends,
        pendingFriends: currentUser.pendingFriends,
        incomingFriends: currentUser.incomingFriends,
        history: currentUser.history,
        categories: currentUser.categories,
        profilePic: photo,
        goals: currentUser.goals
    };
    
    // console.log(userId)
    const updatedInfo = await userCollection.findOneAndUpdate(
        {fire_id: fire_id},
        {$set: updatedUser},
        {returnDocument: 'after'}
    );
    // console.log(updatedInfo)
    if (updatedInfo === null) {
        throw 'Could not update user successfully :: editUserInfo';
    }
    return updatedInfo;
}

const getUser = async (fire_id) => {
    if(!fire_id) throw `Id is required: getUser`
    fire_id = helper.checkFireId(fire_id);

    const userCollection = await users();
    let user = await userCollection.findOne({fire_id: fire_id});
    if (user)
    {
        user._id = user._id.toString();
        return user;
    }
    else
        throw "User not found: getUser";
};

const getUserByMongoId = async (id) => {
    if(!id) throw `fireId is required: getUserByMongoId`

    const userCollection = await users();
    let user = await userCollection.findOne({_id: new ObjectId(id)});
    if (user)
    {
        user._id = user._id.toString();
        return user;
    }
    else
        throw "User not found: getUserByMongoId";
}

const getUserByUsername = async (username) => {
    if(!username) throw `username is required: getUserByUsername`

    const userCollection = await users();
    let user = await userCollection.findOne({username: username.toLowerCase()});
    if (user)
    {
        user._id = user._id.toString();
        return user;
    }
    else
        throw "User not found: getUserByUsername";
}

const getFeed = async (fire_id) => {
    //validations
    if(!fire_id) throw `Id is required: getFeed`
    fire_id = helper.checkFireId(fire_id);
    //get friends list
    let friends = await getAllFriends(fire_id);//expects list of friends' IDs
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
const getHistory = async (fire_id) => {
    //currently calls updateHistory which returns latest data
    fire_id = helper.checkFireId(fire_id);
    let updatedHistory = await updateHistory(fire_id);
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
const updateHistory = async (fire_id) => {
    //basically getGoalsByUserId but the goals date is past, then updates the user's history field

    fire_id = helper.checkFireId(fire_id);
    //check to see that the id is valid
    if(!fire_id) throw `Id is required: updateHistory`
    // if(!ObjectId.isValid(fire_id)) throw `Invalid GoalId: updateHistory`;

    //get the user
    const userCollection = await users();
    let user = await userCollection.findOne({fire_id: fire_id});
    if(user === null) throw `No user exists: updateHistory`;

    //add the goal objects to a goal array
    let pastGoalsArr = [];

    const goalCollection = await goals();
    let allGoals = await goalCollection.find().toArray({});
    for(let i = 0; i < allGoals.length; i++){
        if((allGoals[i].userId).toString() === fire_id.toString() && helper.dateIsInThePast(allGoals[i].goalDate)){
            pastGoalsArr.push(allGoals[i])
        }
    }
    let updateInfo = await userCollection.updateOne(
		{ fire_id: fire_id },
		{ $set: { history: pastGoalsArr } },
		{ returnDocument: 'after' }
	);
	if (updateInfo.modifiedCount === 0 && updateInfo.matchedCount === 0) throw 'Couldn\'t update history: updateHistory';
	if (updateInfo.modifiedCount === 0 && updateInfo.matchedCount === 1) console.log("History up-to-date: updateHistory");

    return pastGoalsArr;
};

const addCategory = async (fire_id, category) => {
    if(!fire_id || !category) throw `Not enough inputs: addCategory`
    // fire_id = helper.checkFireId(fire_id);
    category = helper.checkCategory(category);

    const userCollection = await users();
    let user = await userCollection.findOne({fire_id: fire_id});
    let newCategories = user.categories;
    if (newCategories.includes(category)) {
        throw 'cannot add duplicate category';
    }
    else {
        newCategories.push(category);
    }

    let updatedUser = await userCollection.updateOne(
		{ fire_id: fire_id },
		{ $set: { categories: newCategories } },
		{ returnDocument: 'after' }
	);

    let newUser = await userCollection.findOne({fire_id: fire_id});

    return newUser;
}

export { register, editUserInfo, getUser, getFeed, getHistory, updateHistory, getUserByMongoId, getUserByUsername, addCategory }
