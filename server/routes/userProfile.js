import * as goals from "../data/goals.js";
import * as users from "../data/users.js"
import * as validate from "../../validation.js";
import { Router } from "express";
const router = Router();

router 
    .route("/:userId")
    .get(async (req, res) => {
        //check to make sure the id is valid
        let id = req.params.userId;
        try{
            id = validate.validId(id);
        }catch(e){
            return res.status(400).json({error: e})
        }
        //get all of the goals for the user
        try{
            let allGoals = goals.getGoalsByUserId(id);
            return res.json(allGoals);
        }catch(e){
            return res.status(404).json({error: e})
        }
    });

router 
    .route("/:userId/editProfile")
    .post(async (req, res) => {
        let displayName = req.body.displayName;
        let username = req.body.username;
        let password = req.body.password;
        let age = req.body.age;

        console.log(req.params.userId)
        let user = await goals.getGoalsByUserId(req.params.userId);
        console.log(user)

        //if they didn't supply these vars to change, set them to what they already are
        if (!displayName) {
            displayName = user.displayName;
        }
        if (!username) {
            username = user.username;
        }
        if (!password) {
            password = user.password; //does this work ok - does it just resave the hashed pass?
        }
        if (!age) {
            age = user.age;
        }

        try {
            console.log(displayName)
            console.log(username)
            console.log(password)
            console.log(age)
            await users.editUserInfo(displayName, username, password, age);
        }
        catch (e) {
            console.log(e);
            return res.status(500).json({error: e})
        }
    })

router 
    .route("/:userId/newGoal")
    .get(async (req, res) => {
        //validate the id
        let id = req.params.userId;
        try{
            id = validate.validId(id);
        }catch(e){
            return res.status(400).json({error: e})
        }
        // return res.render('/addGoal')
    })
    .post(async (req, res) => {
        let id = req.params.userId;
        //validate all of the input
        try{
            id = validate.validId(id);
            req.body.title = validate.stringChecker(req.body.title)
            req.body.description = validate.stringChecker(req.body.description);
            req.body.category = validate.stringChecker(req.body.category);
            req.body.goalDate = validate.stringChecker(req.body.goalDate); 
            req.body.limit = validate.limitChecker(req.body.limit);
            req.body.category = await validate.categoryChecker(id, req.body.category)
            req.body.goalDate = validate.goalDateChecker(req.body.goalDate)
        }catch(e){
            return res.status(400).json({error: e})
        }
        //now try to add the goal
        try{
            let added = await goals.addGoal(id, req.body.title, req.body.description, req.body.category, req.body.limit, req.body.goalDate);
            return res.status(200).json(added)
        }catch(e){
            return res.status(500).json({error: e})
        }
    })

router 
    .route("/:userId/:goalId")
    .get(async (req, res) => {
        //validate the ids
        let id = req.params.userId;
        let goalId = req.params.goalId;
        try{
            id = validate.validId(id);
            goalId = validate.validId(goalId);
        }catch(e){
            return res.status(400).json({error: e})
        }
        // return res.render('/editGoal')
    })
    .patch(async (req, res) => {
        //validate the ids
        let id = req.params.userId;
        let goalId = req.params.goalId;
        try{
            id = validate.validId(id);
            goalId = validate.validId(goalId);
        }catch(e){
            return res.status(400).json({error: e})
        }
        //check to make sure at least 1 field is supplied
        if(!req.body.title && !req.body.description && !req.body.category && !req.body.limit && !req.body.goalDate && !req.body.successful && !req.body.expenses && !req.body.likes){
                return res.status(400).json({error: "At least one field must be updated"})
        }
        let user;
        try{
            user = await users.getUser(id);
        }catch(e){
            return res.status(404).json({error: e})
        }
        //now we have to see which are updated, and then call the function
        if(req.body.title){
            try{
                req.body.title = validate.stringChecker(req.body.title);
            }catch(e){
                return res.status(400).json({error: e})
            }
        }else{
            req.body.title = user.title;
        }
        if(req.body.description){
            try{
                req.body.description = validate.stringChecker(req.body.description);
            }catch(e){
                return res.status(400).json({error: e})
            }
        }else{
            req.body.description = user.description;
        }
        if(req.body.category){
            try{
                req.body.category = validate.stringChecker(req.body.category);
                req.body.category = await validate.categoryChecker(req.body.category);            
            }catch(e){
                return res.status(400).json({error: e})
            }
        }else{
            req.body.category = user.category;
        }
        if(req.body.limit){
            try{
                req.body.limit = validate.limitChecker(req.body.limit)
            }catch(e){
                return res.status(400).json({error: e})
            }
        }else{
            req.body.limit = user.limit;
        }
        if(req.body.goalDate){
            try{
                req.body.goalDate = validate.stringChecker(req.body.goalDate);
                req.body.goalDate = validate.goalDateChecker(req.body.goalDate);         
            }catch(e){
                return res.status(400).json({error: e})
            }
        }else{
            req.body.goalDate = user.goalDate;
        }
        if(req.body.successful){
            try{
                req.body.successful = validate.isBoolean(req.body.successful);
            }catch(e){
                return res.status(400).json({error: e})
            }
        }else{
            req.body.successful = user.successful;
        }
        if(req.body.expenses){
            try{
                req.body.expenses = validate.isIdArray(req.body.expenses)
            }catch(e){
                return res.status(400).json({error: e})
            }
        }else{
            req.body.expenses = user.expenses;
        }
        if(req.body.likes){
            try{
                req.body.likes = validate.isIdArray(req.body.likes)
            }catch(e){
                return res.status(400).json({error: e})
            }
        }else{
            req.body.likes = user.likes;
        }
        //now update the goal
        try{
            let updated = await goals.updateGoal(goalId, id, req.body.title, req.body.description, req.body.category, req.body.limit, req.body.goalDate, req.body.successful, req.body.expenses, req.body.likes);
            return res.status(200).json(updated)
        }catch(e){
            return res.status(500).json({error: e})
        }
    })
router
    .route("/:userId/history")
    .get(async (req, res) => {
        //validate the id
        let id = req.params.userId;
        try{
            id = validate.validId(id);
        }catch(e){
            return res.status(400).json({error: e})
        }
        try{
            let history = await users.getHistory(id);
            return res.status(200).json({history: history});
        }
        catch (e)
        {
            return res.status(404).json({error: e})
        }
    })

export default router;