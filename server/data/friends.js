import { users } from "../config/mongoCollections";
import { ObjectId } from "mongodb";

const sendFriendRequest = async (fromUserId, toUserId) => {
    if(!fromUserId || !toUserId) throw `Ids are required: sendFriendRequest`
    if(typeof fromUserId != "string" || typeof toUserId != "string") throw "Invalid id(s): removeFriend"
    fromUserId = fromUserId.trim()
    toUserId = toUserId.trim()
    if(!ObjectId.isValid(fromUserId) || !Object.isValid(toUserId)) throw `Invalid id(s): sendFriendRequest`;
    
    const userCollection = await users();
    let user1 = userCollection.findOne({_id: new ObjectId(fromUserId)});
    let user2 = userCollection.findOne({_id: new ObjectId(toUserId)});
    if (!user1 || !user2) throw "User(s) not found: sendFriendRequest"

    let code = "CODE_NOT_SET";
    if(toUserId in user1.pendingFriends) throw "User already in pending list: sendFriendRequest"
    else if(toUserId in user1.friends) throw "User already in friends list: sendFriendRequest"
    else if(toUserId in user1.incomingFriends) {
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
    await userCollection.updateOne({_id: new ObjectId(fromUserId)}, user1)
    await userCollection.updateOne({_id: new ObjectId(toUserId)}, user2)

    return {code: code, from: fromUserId, to: toUserId}
}

const acceptRequest = async (fromUserId, toUserId) => {
    if(!fromUserId || !toUserId) throw `Ids are required: acceptRequest`
    if(typeof fromUserId != "string" || typeof toUserId != "string") throw "Invalid id(s): removeFriend"
    fromUserId = fromUserId.trim()
    toUserId = toUserId.trim()
    if(!ObjectId.isValid(fromUserId) || !Object.isValid(toUserId)) throw `Invalid id(s): acceptRequest`;
    
    const userCollection = await users();
    let user1 = userCollection.findOne({_id: new ObjectId(fromUserId)});
    let user2 = userCollection.findOne({_id: new ObjectId(toUserId)});
    if (!user1 || !user2) throw "User(s) not found: acceptRequest"

    let code = "CODE_NOT_SET";
    if(toUserId in user1.friends) throw "User already in friends list: acceptRequest"
    else if(toUserId in user1.incomingFriends) {
        user1.friends.push(toUserId)
        user2.friends.push(fromUserId)

        user1.incomingFriends = user1.incomingFriends.filter((id) => id != toUserId)
        user2.pendingFriends = user2.pendingFriends.filter((id) => id != fromUserId)

        code = "FRIEND_ACCEPTED"
    }
    else throw "No incoming friend request: acceptRequest"

    await userCollection.updateOne({_id: new ObjectId(fromUserId)}, user1)
    await userCollection.updateOne({_id: new ObjectId(toUserId)}, user2)

    return {code: code, from: fromUserId, to: toUserId}
}

const declineRequest = async (fromUserId, toUserId) => {
    if(!fromUserId || !toUserId) throw `Ids are required: declineRequest`
    if(typeof fromUserId != "string" || typeof toUserId != "string") throw "Invalid id(s): removeFriend"
    fromUserId = fromUserId.trim()
    toUserId = toUserId.trim()
    if(!ObjectId.isValid(fromUserId) || !Object.isValid(toUserId)) throw `Invalid id(s): declineRequest`;
    
    const userCollection = await users();
    let user1 = userCollection.findOne({_id: new ObjectId(fromUserId)});
    let user2 = userCollection.findOne({_id: new ObjectId(toUserId)});
    if (!user1 || !user2) throw "User(s) not found: declineRequest"

    let code = "CODE_NOT_SET";
    if(toUserId in user1.friends) throw "User already in friends list: declineRequest"
    else if(toUserId in user1.incomingFriends) {
        user1.incomingFriends = user1.incomingFriends.filter((id) => id != toUserId)
        user2.pendingFriends = user2.pendingFriends.filter((id) => id != fromUserId)

        code = "FRIEND_DECLINED"
    }
    else throw "No incoming friend request: declineRequest"
    
    await userCollection.updateOne({_id: new ObjectId(fromUserId)}, user1)
    await userCollection.updateOne({_id: new ObjectId(toUserId)}, user2)

    return {code: code, from: fromUserId, to: toUserId}
}

const cancelRequest = async (fromUserId, toUserId) => {
    if(!fromUserId || !toUserId) throw `Ids are required: cancelRequest`
    if(typeof fromUserId != "string" || typeof toUserId != "string") throw "Invalid id(s): removeFriend"
    fromUserId = fromUserId.trim()
    toUserId = toUserId.trim()
    if(!ObjectId.isValid(fromUserId) || !Object.isValid(toUserId)) throw `Invalid id(s): cancelRequest`;
    
    const userCollection = await users();
    let user1 = userCollection.findOne({_id: new ObjectId(fromUserId)});
    let user2 = userCollection.findOne({_id: new ObjectId(toUserId)});
    if (!user1 || !user2) throw "User(s) not found: cancelRequest"

    let code = "CODE_NOT_SET";
    if(toUserId in user1.friends) throw "User already in friends list: cancelRequest"
    else if(toUserId in user1.pendingFriends) {
        user1.pendingFriends = user1.pendingFriends.filter((id) => id != toUserId)
        user2.incomingFriends = user2.incomingFriends.filter((id) => id != fromUserId)

        code = "REQUEST_CANCELLED"
    }
    else throw "No pending friend request: cancelRequest"

    await userCollection.updateOne({_id: new ObjectId(fromUserId)}, user1)
    await userCollection.updateOne({_id: new ObjectId(toUserId)}, user2)

    return {code: code, from: fromUserId, to: toUserId}
}

const removeFriend = async (fromUserId, toUserId) => {
    if(!fromUserId || !toUserId) throw `Ids are required: removeFriend`
    if(typeof fromUserId != "string" || typeof toUserId != "string") throw "Invalid id(s): removeFriend"
    fromUserId = fromUserId.trim()
    toUserId = toUserId.trim()
    if(!ObjectId.isValid(fromUserId) || !Object.isValid(toUserId)) throw `Invalid id(s): removeFriend`;
    
    const userCollection = await users();
    let user1 = userCollection.findOne({_id: new ObjectId(fromUserId)});
    let user2 = userCollection.findOne({_id: new ObjectId(toUserId)});
    if (!user1 || !user2) throw "User(s) not found: removeFriend"

    let code = "CODE_NOT_SET";
    if(toUserId in user1.friends) {
        user1.friends = user1.friends.filter((id) != toUserId)
        user2.friends = user2.friends.filter((id) != fromUserId)

        code = "FRIEND_REMOVED"
    }
    else throw "Users not friended: removeFriend"

    await userCollection.updateOne({_id: new ObjectId(fromUserId)}, user1)
    await userCollection.updateOne({_id: new ObjectId(toUserId)}, user2)

    return {code: code, from: fromUserId, to: toUserId}
}

const getPendingRequests = async (userId) => {
    if(!userId) throw `Ids are required: getPendingRequests`
    if(typeof userId != "string") throw `Invalid id: getPendingRequests`
    userId = userId.trim()
    if(!ObjectId.isValid(userId)) throw `Invalid id: getPendingRequests`

    const userCollection = await users();
    let user = userCollection.findOne({_id: new ObjectId(userId)})
    if(!user) throw "User not found: getPendingRequests"

    return user.pendingFriends
}

const getIncomingRequests = async (userId) => {
    if(!userId) throw `Ids are required: getPendingRequests`
    if(typeof userId != "string") throw `Invalid id: getPendingRequests`
    userId = userId.trim()
    if(!ObjectId.isValid(userId)) throw `Invalid id: getPendingRequests`

    const userCollection = await users();
    let user = userCollection.findOne({_id: new ObjectId(userId)})
    if(!user) throw "User not found: getPendingRequests"

    return user.incomingFriends
}

const getAllFriends = async (userId) => {
    if(!userId) throw `Ids are required: getPendingRequests`
    if(typeof userId != "string") throw `Invalid id: getPendingRequests`
    userId = userId.trim()
    if(!ObjectId.isValid(userId)) throw `Invalid id: getPendingRequests`

    const userCollection = await users();
    let user = userCollection.findOne({_id: new ObjectId(userId)})
    if(!user) throw "User not found: getPendingRequests"

    return user.friends
}

export {sendFriendRequest, acceptRequest, declineRequest, cancelRequest, removeFriend, getPendingRequests, getIncomingRequests, getAllFriends}