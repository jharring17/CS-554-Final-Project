import * as goals from "../data/goals.js";
import * as users from "../data/users.js"
import * as validate from "../../validation.js";
import { Router } from "express";
const router = Router();

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
            let history = await users.getFeed(id);
            return res.status(200).json({history: history});
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
