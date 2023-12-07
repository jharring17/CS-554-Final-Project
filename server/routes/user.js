import * as goals from "../data/goals.js";
import * as users from "../data/users.js"
import * as validate from "../../validation.js";
import { Router } from "express";
const router = Router();

router
    .route("/register")
    .post(async (req, res) => {
        let fire_id = req.body.fire_id;
        let displayName = req.body.displayName;
        let username = req.body.username;
        let email = req.body.email;
        let password = req.body.password;
        let age = req.body.age;

        //error check inputs
        try {
            fire_id = validate.checkFireId(fire_id);
            username = validate.checkName(username, "username");
            password = validate.checkPassword(password);
            email = validate.checkEmail(email);
            age = validate.checkAge(age);
        }
        catch (e) {
            console.log(e);
            return res.status(401).json({error: e})
        }

        try {
            let newUser = await users.register(fire_id, displayName, username, email, password, age);
            return res.status(200).json(newUser)
        }
        catch (e) {
            console.log(e);
            return res.status(500).json({error: e})
        }
    })

router
    .route("/:userId/feed")
    .get(async (req, res) => {
        //validate the id
        let id = req.params.userId;
        try{
            id = validate.validId(id);
        }catch(e){
            return res.status(400).json({error: e})
        }
        try{
            let feed = await users.getFeed(id);
            return res.status(200).json({feed: feed});
        }
        catch (e)
        {
            return res.status(404).json({error: e})
        }
    })

router
    .route("/:userId/:goalId/like")
    .post(async (req, res) => {
        //validate the ids
        let userId = req.params.userId;
        let goalId = req.params.goalId;
        try{
            userId = validate.validId(userId);
            goalId = validate.validId(goalId);
        }catch(e){
            return res.status(400).json({error: e})
        }
        try{
            let updatedGoal = await goals.likePost(userId, goalId);
            return res.status(200).json({updatedGoal: updatedGoal});
        }
        catch (e)
        {
            return res.status(404).json({error: e})
        }
    })

export default router;
