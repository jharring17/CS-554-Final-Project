import * as goals from "../data/goals.js";
import * as users from "../data/users.js"
import * as validate from "../../validation.js";
import * as friends from "../data/friends.js";
import {isValid, parse, isBefore, startOfDay} from 'date-fns'
import { Router } from "express";

const router = Router();
import redis from 'redis';
const client = redis.createClient();
client.connect().then(() => {});

router.route('/:userId').get(async (req, res) => {
	//check to make sure the id is valid
	let id = req.params.userId;
	try {
		id = validate.checkFireId(id);
	} catch (e) {
		return res.status(400).json({ error: e });
	}
	//check to see if it's in the cache
	let stored = await client.exists(`goals-for-user-${id}`);
	if (stored) {
		//get the data from the cache
		console.log('data was in the cache');
		let userPageInfo = await client.get(`goals-for-user-${id}`);
		userPageInfo = JSON.parse(userPageInfo);
		return res.status(200).json(userPageInfo);
	} else {
		console.log('data was not in cache');
		// get all of the goals for the user
		try {
			let allGoals = await goals.getGoalsByUserId(id);
			let asString = JSON.stringify(allGoals);
			let addedToCache = await client.setEx(`goals-for-user-${id}`, 3600, asString);
			let removeFromCache = await client.del(`friend-${id}`);
			return res.status(200).json(allGoals);
		} catch (e) {
			return res.status(404).json({ error: e });
		}
	}
});

router.route('/:userId/editProfile').post(async (req, res) => {
	let displayName = req.body.displayName;
	let username = req.body.username;
	let email = req.body.email;
	let photo = req.body.photo;
	// let password = req.body.password;

	let user = await users.getUser(req.params.userId);

	//if they didn't supply these vars to change, set them to what they already are
	if (!displayName) {
		displayName = user.displayName;
	}
	if (!username) {
		username = user.username;
	}
	if (!email) {
		email = user.email;
	}

	//error check
	try {
		displayName = validate.checkName(displayName, 'displayName');
		username = validate.checkName(username, 'username');
		email = validate.checkEmail(email);
	} catch (e) {
		return res.status(400).json({ error: e });
	}

        try {
            let newUser = await users.editUserInfo(req.params.userId, displayName, username, email, photo);
            let removeFromCache = await client.del(`goals-for-user-${req.params.userId}`)
            let removeFriendFromCache = await client.del(`friend-${req.params.userId}`)
            return res.status(200).json(newUser)
        }
        catch (e) {
            if (e.includes('already taken')) {
                return res.status(400).json({ error: e });
            }
            return res.status(500).json({error: e})
        }
    })

router 
    .route("/:userId/newGoal")
    .get(async (req, res) => {
        //validate the id
        let id = req.params.userId;
        try{
            id = validate.checkFireId(id);
        }catch(e){
            return res.status(400).json({error: e})
        }
        // return res.render('/addGoal')
    })
    .post(async (req, res) => {
        let id = req.params.userId;
        //validate all of the input
        try{
            id = validate.checkFireId(id);
            req.body.title = validate.checkGoalTitle(req.body.title);
            req.body.description = validate.checkGoalDesc(req.body.description);
            req.body.category = validate.stringChecker(req.body.category);
            req.body.goalDate = validate.stringChecker(req.body.goalDate); 
            req.body.limit = parseFloat(req.body.limit)
            req.body.limit = validate.limitChecker(req.body.limit);
        }catch(e){
            console.log(e)
            return res.status(400).json({error: e})
        }
        let split = req.body.goalDate.split("/");
        if (split.length != 3 || split[0].length !== 2 || split[1].length !== 2 || split[2].length != 4) {
            return res.status(400).json({error: "Date must be in the form MM/DD/YYYY"}) 
        }
        let parsedDate = parse(req.body.goalDate, 'MM/dd/yyyy', new Date());
        if (!isValid(parsedDate)) {
            return res.status(400).json({error: "Date must be a valid date"}) 
        }
        if (isBefore(parsedDate, startOfDay(new Date())) ) {
            return res.status(400).json({error: "Date must be today's date or a future date"}) 
        }
        try {
            req.body.category = await validate.categoryChecker(id, req.body.category);
        }
        catch (e)
        {
            console.log(e);
            return res.status(404).json({error: e})
        }
        //now try to add the goal
        try{
            let added = await goals.addGoal(id, req.body.title, req.body.description, req.body.category, req.body.limit, req.body.goalDate);
            let removeFromCache = await client.del(`goals-for-user-${id}`);
            return res.status(200).json(added)
        }catch(e){
            console.log(e);
            return res.status(500).json({error: e})
        }
    })

router
    .route("/:userId/history")
    .get(async (req, res) => {
        //validate the id
        let id = req.params.userId;
        console.log(id);
        try{
            id = validate.checkFireId(id);
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

// 	try {
// 		let newUser = await users.editUserInfo(
// 			req.params.userId,
// 			displayName,
// 			username,
// 			email,
// 			photo
// 		);
// 		let removeFromCache = await client.del(`goals-for-user-${req.params.userId}`);
// 		let removeFriendFromCache = await client.del(`friend-${req.params.userId}`);
// 		return res.status(200).json(newUser);
// 	} catch (e) {
// 		console.log('Error from data function: ', e);
// 		if (e.includes('already taken')) {
// 			return res.status(400).json({ error: e });
// 		}
// 		return res.status(500).json({ error: e });
// 	}
// });

// router
// 	.route('/:userId/newGoal')
// 	.get(async (req, res) => {
// 		//validate the id
// 		let id = req.params.userId;
// 		try {
// 			id = validate.checkFireId(id);
// 		} catch (e) {
// 			return res.status(400).json({ error: e });
// 		}
// 		// return res.render('/addGoal')
// 	})
// 	.post(async (req, res) => {
// 		let id = req.params.userId;
// 		//validate all of the input
// 		try {
// 			id = validate.checkFireId(id);
// 			req.body.title = validate.checkGoalTitle(req.body.title);
// 			req.body.description = validate.checkGoalDesc(req.body.description);
// 			req.body.category = validate.stringChecker(req.body.category);
// 			req.body.goalDate = validate.stringChecker(req.body.goalDate);
// 			req.body.limit = validate.limitChecker(req.body.limit);
// 			// req.body.goalDate = validate.goalDateChecker(req.body.goalDate);
// 		} catch (e) {
// 			console.log(e);
// 			return res.status(400).json({ error: e });
// 		}
// 		try {
// 			req.body.category = await validate.categoryChecker(id, req.body.category);
// 		} catch (e) {
// 			console.log(e);
// 			return res.status(404).json({ error: e });
// 		}
// 		//now try to add the goal
// 		try {
// 			let added = await goals.addGoal(
// 				id,
// 				req.body.title,
// 				req.body.description,
// 				req.body.category,
// 				req.body.limit,
// 				req.body.goalDate
// 			);
// 			let removeFromCache = await client.del(`goals-for-user-${id}`);
// 			return res.status(200).json(added);
// 		} catch (e) {
// 			console.log(e);
// 			return res.status(500).json({ error: e });
// 		}
// 	});

// router.route('/:userId/history').get(async (req, res) => {
// 	//validate the id
// 	let id = req.params.userId;
// 	console.log(id);
// 	try {
// 		id = validate.checkFireId(id);
// 	} catch (e) {
// 		return res.status(400).json({ error: e });
// 	}
// 	try {
// 		let history = await users.getHistory(id);
// 		return res.status(200).json({ history: history });
// 	} catch (e) {
// 		return res.status(404).json({ error: e });
// 	}
// });

router.route('/:userId/friends').get(async (req, res) => {
	try {
		let friendList = await friends.getAllFriends(req.params.userId);
		return res.status(200).json(friendList);
	} catch (e) {
		console.log(e);
		return res.status(500).json({ error: e });
	}
});

router 
    .route("/:userId/:goalId")
    .get(async (req, res) => {
        //validate the ids
        let id = req.params.userId;
        let goalId = req.params.goalId;
        try{
            id = validate.checkFireId(id);
            goalId = validate.validId(goalId);
        }catch(e){
            return res.status(400).json({error: e})
        }
        try{
            let goal = await goals.getGoalById(goalId)
            return res.status(200).json(goal)
        }catch(e){
            return res.status(500).json({error: e})

        }
    })
    .patch(async (req, res) => {
        //validate the ids
        let id = req.params.userId;
        let goalId = req.params.goalId;
        try{
            id = validate.checkFireId(id);
            goalId = validate.validId(goalId);
        }catch(e){
            return res.status(400).json({error: e})
        }
        //check to make sure at least 1 field is supplied
        if(!req.body.title && !req.body.description && !req.body.category && !req.body.limit && !req.body.goalDate && !req.body.successful && !req.body.expenses && !req.body.likes){
                return res.status(400).json({error: "At least one field must be updated"})
        }
        let goal;
        try{
            goal = await goals.getGoalById(goalId);
        }catch(e){
            return res.status(404).json({error: e})
        }
        //now we have to see which are updated, and then call the function
        if(req.body.title){
            try{
                req.body.title = validate.checkGoalTitle(req.body.title);
            }catch(e){
                return res.status(400).json({error: e})
            }
        }else{
            req.body.title = goal.title;
        }
        if(req.body.description){
            try{
                req.body.description = validate.checkGoalDesc(req.body.description);
            }catch(e){
                return res.status(400).json({error: e})
            }
        }else{
            req.body.description = goal.description;
        }
        if(req.body.category){
            try{
                req.body.category = validate.stringChecker(req.body.category);
            }catch(e){
                return res.status(400).json({error: e})
            }
            try {
                req.body.category = await validate.categoryChecker(req.body.userId, req.body.category);            
            }
            catch (e)
            {
                console.log(e);
                return res.status(404).json({error: e})
            }
        }else{
            req.body.category = goal.category;
        }
        if(req.body.limit){
            req.body.limit = parseFloat(req.body.limit)
            try{
                req.body.limit = validate.limitChecker(req.body.limit)
            }catch(e){
                return res.status(400).json({error: e})
            }
        }else{
            req.body.limit = goal.limit;
        }
        if(req.body.goalDate){
            try{
                req.body.goalDate = validate.stringChecker(req.body.goalDate);
            }catch(e){
                return res.status(400).json({error: e})
            }
            let split = req.body.goalDate.split("/");
            if (split.length != 3 || split[0].length !== 2 || split[1].length !== 2 || split[2].length != 4) {
                return res.status(400).json({error: "Date must be in the form MM/DD/YYYY"}) 
            }
            let parsedDate = parse(req.body.goalDate, 'MM/dd/yyyy', new Date());
            if (!isValid(parsedDate)) {
                return res.status(400).json({error: "Date must be a valid date"}) 
            }
            if (isBefore(parsedDate, startOfDay(new Date())) ) {
                return res.status(400).json({error: "Date must be today's date or a future date"}) 
            }
        }else{
            req.body.goalDate = goal.goalDate;
        }
        if(req.body.successful){
            try{
                req.body.successful = validate.isBoolean(req.body.successful);
            }catch(e){
                return res.status(400).json({error: e})
            }
        }else{
            req.body.successful = goal.successful;
        }
        if(req.body.expenses){
            try{
                req.body.expenses = validate.isIdArray(req.body.expenses)
            }catch(e){
                return res.status(400).json({error: e})
            }
        }else{
            req.body.expenses = goal.expenses;
        }
        if(req.body.likes){
            try{
                req.body.likes = validate.isFireIdArr(req.body.likes)

            }catch(e){
                return res.status(400).json({error: e})
            }
        }else{
            req.body.likes = goal.likes;
        }
        //now update the goal
        try{
            let updated = await goals.updateGoal(goalId, id, req.body.title, req.body.description, req.body.category, req.body.limit, req.body.goalDate, req.body.successful, req.body.expenses, req.body.likes);
            let removeFromCache = await client.del(`goals-for-user-${id}`);
            return res.status(200).json(updated)
        }catch(e){
            return res.status(500).json({error: e})
        }
    })
    .delete(async (req, res) =>{
        let id = req.params.userId;
        let goalId = req.params.goalId;
        try{
            id = validate.checkFireId(id);
            goalId = validate.validId(goalId);
        }catch(e){
            return res.status(400).json({error: e})
        }        
        //now delete the goal
        try{
            let deleted = await goals.deleteGoal(goalId);
            let removeFromCache = await client.del(`goals-for-user-${id}`);
            let removeFriendFromCache = await client.del(`friend-${id}`)
            return res.status(200).json(deleted)
        }catch(e){
            return res.status(500).json({error: e})
        }
    })


export default router;
