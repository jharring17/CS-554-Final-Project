// register, login, delete, editUser, getUser, getFeed, getHistory
import {users, goals} from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import { getGoalsByUserId } from './goals.js';
import * as helper from "../../validation.js"

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

    try {
        let user = await getUser(id);
        return user.history;
    }
    catch (e)
    {
        throw "User not found: getHistory";
    }
};
export { getUser, getFeed, getHistory }
