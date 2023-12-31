import { users } from "../config/mongoCollections.js";
import { removeFromLikesList } from './goals.js';

const sendFriendRequest = async (fromUserId, toUserId) => {
    if(!fromUserId || !toUserId) throw `Ids are required: sendFriendRequest`
    if(typeof fromUserId != "string" || typeof toUserId != "string") throw "Invalid id(s): sendFriendRequest"
    fromUserId = fromUserId.trim()
    toUserId = toUserId.trim()
    
    const userCollection = await users();
    let user1 = await userCollection.findOne({fire_id: fromUserId});
    let user2 = await userCollection.findOne({fire_id: toUserId});
    if (!user1 || !user2) throw "User(s) not found: sendFriendRequest"

    let code = "CODE_NOT_SET";
    if(user1.pendingFriends.includes(toUserId)) throw "User already in pending list: sendFriendRequest"
    else if(user1.friends.includes(toUserId)) throw "User already in friends list: sendFriendRequest"
    else if(user1.incomingFriends.includes(toUserId)) {
        user1.friends.push(toUserId)
        user2.friends.push(fromUserId)

        user1.incomingFriends = user1.incomingFriends.filter((id) => id != toUserId)
        user2.pendingFriends = user2.pendingFriends.filter((id) => id != fromUserId)

        code = "FRIEND_ACCEPTED"
    }
    else {
        user1.pendingFriends.push(toUserId)
        user2.incomingFriends.push(fromUserId)

        code = "REQUEST_SENT"
    }
    await userCollection.updateOne({fire_id: fromUserId}, {$set: user1})
    await userCollection.updateOne({fire_id: toUserId}, {$set: user2})

    return {code: code, from: fromUserId, to: toUserId}
}

const acceptRequest = async (fromUserId, toUserId) => {
    if(!fromUserId || !toUserId) throw `Ids are required: acceptRequest`
    if(typeof fromUserId != "string" || typeof toUserId != "string") throw "Invalid id(s): acceptRequest"
    fromUserId = fromUserId.trim()
    toUserId = toUserId.trim()
    
    const userCollection = await users();
    let user1 = await userCollection.findOne({fire_id: fromUserId});
    let user2 = await userCollection.findOne({fire_id: toUserId});
    if (!user1 || !user2) throw "User(s) not found: acceptRequest"

    let code = "CODE_NOT_SET";
    if(user1.friends.includes(toUserId)) throw "User already in friends list: acceptRequest"
    else if(user1.incomingFriends.includes(toUserId)) {
        user1.friends.push(toUserId)
        user2.friends.push(fromUserId)

        user1.incomingFriends = user1.incomingFriends.filter((id) => id != toUserId)
        user2.pendingFriends = user2.pendingFriends.filter((id) => id != fromUserId)

        code = "FRIEND_ACCEPTED"
    }
    else throw "No incoming friend request: acceptRequest"

    await userCollection.updateOne({fire_id: fromUserId}, {$set: user1})
    await userCollection.updateOne({fire_id: toUserId}, {$set: user2})

    return {code: code, from: fromUserId, to: toUserId}
}

const declineRequest = async (fromUserId, toUserId) => {
    if(!fromUserId || !toUserId) throw `Ids are required: declineRequest`
    if(typeof fromUserId != "string" || typeof toUserId != "string") throw "Invalid id(s): declineRequest"
    fromUserId = fromUserId.trim()
    toUserId = toUserId.trim()
    
    const userCollection = await users();
    let user1 = await userCollection.findOne({fire_id: fromUserId});
    let user2 = await userCollection.findOne({fire_id: toUserId});
    if (!user1 || !user2) throw "User(s) not found: declineRequest"

    let code = "CODE_NOT_SET";
    if(user1.friends.includes(toUserId)) throw "User already in friends list: declineRequest"
    else if(user1.incomingFriends.includes(toUserId)) {
        user1.incomingFriends = user1.incomingFriends.filter((id) => id != toUserId)
        user2.pendingFriends = user2.pendingFriends.filter((id) => id != fromUserId)

        code = "FRIEND_DECLINED"
    }
    else throw "No incoming friend request: declineRequest"
    
    await userCollection.updateOne({fire_id: fromUserId}, {$set: user1})
    await userCollection.updateOne({fire_id: toUserId}, {$set: user2})

    return {code: code, from: fromUserId, to: toUserId}
}

const cancelRequest = async (fromUserId, toUserId) => {
    if(!fromUserId || !toUserId) throw `Ids are required: cancelRequest`
    if(typeof fromUserId != "string" || typeof toUserId != "string") throw "Invalid id(s): cancelRequest"
    fromUserId = fromUserId.trim()
    toUserId = toUserId.trim()
    
    const userCollection = await users();
    let user1 = await userCollection.findOne({fire_id: fromUserId});
    let user2 = await userCollection.findOne({fire_id: toUserId});
    if (!user1 || !user2) throw "User(s) not found: cancelRequest"

    let code = "CODE_NOT_SET";
    if(user1.friends.includes(toUserId)) throw "User already in friends list: cancelRequest"
    else if(user1.pendingFriends.includes(toUserId)) {
        user1.pendingFriends = user1.pendingFriends.filter((id) => id != toUserId)
        user2.incomingFriends = user2.incomingFriends.filter((id) => id != fromUserId)

        code = "REQUEST_CANCELLED"
    }
    else throw "No pending friend request: cancelRequest"

    await userCollection.updateOne({fire_id: fromUserId}, {$set: user1})
    await userCollection.updateOne({fire_id: toUserId}, {$set: user2})

    return {code: code, from: fromUserId, to: toUserId}
}

const removeFriend = async (fromUserId, toUserId) => {
    if(!fromUserId || !toUserId) throw `Ids are required: removeFriend`
    if(typeof fromUserId != "string" || typeof toUserId != "string") throw "Invalid id(s): removeFriend"
    fromUserId = fromUserId.trim()
    toUserId = toUserId.trim()
    
    const userCollection = await users();
    let user1 = await userCollection.findOne({fire_id: fromUserId});
    let user2 = await userCollection.findOne({fire_id: toUserId});
    if (!user1 || !user2) throw "User(s) not found: removeFriend"

    let code = "CODE_NOT_SET";

    if(user1.friends.includes(toUserId)) {
        user1.friends = user1.friends.filter((id) => id != toUserId)
        user2.friends = user2.friends.filter((id) => id != fromUserId)

        code = "FRIEND_REMOVED"
    }
    else throw "Users not friended: removeFriend"

    await userCollection.updateOne({fire_id: fromUserId}, {$set: user1})
    await userCollection.updateOne({fire_id: toUserId}, {$set: user2})

    await removeFromLikesList(fromUserId, toUserId);

    return {code: code, from: fromUserId, to: toUserId}
}

const getPendingRequests = async (userId) => {
    if(!userId) throw `Ids are required: getPendingRequests`
    if(typeof userId != "string") throw `Invalid id: getPendingRequests`
    userId = userId.trim()

    const userCollection = await users();
    let user = await userCollection.findOne({fire_id: userId})
    if(!user) throw "User not found: getPendingRequests"

    return user.pendingFriends
}

const getIncomingRequests = async (userId) => {
    if(!userId) throw `Ids are required: getIncomingRequests`
    if(typeof userId != "string") throw `Invalid id: getIncomingRequests`
    userId = userId.trim()

    const userCollection = await users();
    let user = await userCollection.findOne({fire_id: userId})
    if(!user) throw "User not found: getIncomingRequests"

    return user.incomingFriends
}

const getAllFriends = async (userId) => {
    if(!userId) throw `Ids are required: getAllFriends`
    if(typeof userId != "string") throw `Invalid id: getAllFriends`
    userId = userId.trim()

    const userCollection = await users();
    let user = await userCollection.findOne({fire_id: userId})
    if(!user) throw "User not found: getAllFriends"

    return user.friends
}

export {sendFriendRequest, acceptRequest, declineRequest, cancelRequest, removeFriend, getPendingRequests, getIncomingRequests, getAllFriends}
