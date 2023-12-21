import { Router } from "express";
const router = Router();
import {sendFriendRequest, acceptRequest, declineRequest, cancelRequest, removeFriend, getPendingRequests, getIncomingRequests, getAllFriends} from "../data/friends.js"
import redis from 'redis';
const client = redis.createClient();
client.connect().then(()=>{})


router.post("/request/:func", async (req, res) => {
    let func = req.params.func
    let user1 = req.body.user1
    let user2 = req.body.user2
    let data
    let funcList = ["SEND", "ACCEPT", "DECLINE", "CANCEL", "REMOVE"]
    if(!funcList.includes(func)) return res.status(400).json({error: "Invalid Function"})
    try {
    if(!user1 || !user2 || typeof user1 != "string" || typeof user2 != "string") throw "Invalid User Id(s)"
    if(user1.trim() == user2.trim()) throw "Cannot friend yourself"
    await client.del(`friend-${user1}`)
    await client.del(`friend-${user2}`)
    switch (func.toUpperCase()){
        case "SEND":
            data = await sendFriendRequest(user1, user2)
            break;
        case "ACCEPT":
            data = await acceptRequest(user1, user2)
            break;
        case "DECLINE":
            data = await declineRequest(user1, user2)
            break;
        case "CANCEL":
            data = await cancelRequest(user1, user2)
            break;
        case "REMOVE":
            data = await removeFriend(user1, user2) 
            break;
        default:
            return res.status(400).json({error: "Bad function type"})
        }
        return res.json(data)
    } catch(e) {return res.status(400).json(e)}
})

router.get("/request/:func/:userid", async (req, res) => {
    let func = req.params.func
    let user1 = req.params.userid
    let funcList = ["GETP", "GETI", "GETA"]
    let data
    if(!funcList.includes(func)) return res.status(400).json({error: "Invalid Function"})
    try {
        if(!user1 || typeof user1 != "string") throw "Invalid User Id"
        switch (func.toUpperCase()){
            case "GETP":
                data = await getPendingRequests(user1)
                break;
            case "GETI":
                data = await getIncomingRequests(user1)
                break;
            case "GETA":
                data = await getAllFriends(user1)
                break;
            default:
                return res.status(400).json({error: "Bad function type"})
        }
        return res.json(data)
    } catch(e) {return res.status(400).json(e)}
})

export default router