import {React, useState, useEffect} from 'react'
import axios from 'axios'
import { doGetUID } from "../firebase/FirebaseFunctions";
import {isValid, parse, isBefore, startOfDay} from 'date-fns'

function EditGoal(props){
    const [goal, setGoal] = useState(null);
    const [categories, setCategories] = useState(null);
    const [error, setError] = useState(null);
    const [fillDate, setFillDate] = useState('')

    let title, description, category, limit, goalDate;

    useEffect( () => {
        setError(null);
        setGoal(null)
        setCategories(null)
        async function getGoalInfo(){
            let id = doGetUID();
            let data = await axios.get(`http://localhost:3000/userProfile/${id}/${props.goal}`)
            setGoal(data.data)

            //change the date to fill the format of the form
            let currDate = data.data.goalDate;
            // currDate = currDate.split('/')
            // currDate = currDate[2] + '-' + currDate[0] + '-' + currDate[1];
            setFillDate(currDate)

            let userData = await axios.get(`http://localhost:3000/user/${id}/getUserInfo`)
            setCategories(userData.data.categories)
        }
        getGoalInfo();
    }, [])

    async function submitGoal(e){
        e.preventDefault();

        let waiting = false;
        let title = document.getElementById('title').value.trim();
        //title
        if(typeof title != 'string') {
            setError(`Title must be a string`);
            waiting = true;
            return
        }
        title = title.trim();
        if(title.length === 0) {
            setError(`Title cannot be empty`);
            waiting = true;
            return
        }
        if (title.length < 3) {
            setError(`Title length must be at least 3`);
            waiting = true;
            return
        }
        if (title.length > 50) {
            setError(`Title length cannot exceed 50 characters`);
            waiting = true;
            return
        }
        if (!/[A-Za-z]/.test(title)) {
            setError(`Title must contain at least one letter`);
            waiting = true;
            return
        }
        if (!/^[A-Za-z0-9:&$%-]/.test(title)) {
            setError(`Title is invalid`);
            waiting = true;
            return
        }
        if(title.length === 0){
            setError("Title Cannot Be An Empty String")
            waiting = true;
            return
        }
        //desc
        let description = document.getElementById('description').value.trim();
        if(typeof description != 'string') {
            setError(`Description must be a string`);
            waiting = true;
            return
        }
        description = description.trim();
        if(description.length === 0) {
            setError(`Description cannot be empty`);
            waiting = true;
            return
        }
        if (description.length < 5) {
            setError(`Description length must be at least 5`);
            waiting = true;
            return
        }
        if (description.length > 200) {
            setError(`Description length cannot exceed 200 characters`);
            waiting = true;
            return
        }
        if (!/[A-Za-z]/.test(description)) {
            setError(`Description must contain at least one letter`);
            waiting = true;
            return
        }

        let limit = document.getElementById('limit').value.trim();
        if (!/^[0-9]+(\.[0-9]+)?$/.test(limit)) {
			setError(`Amount field can only contain numbers and decimals.`);
			waiting = true;
			return
		}

        limit = parseFloat(limit);
        let temp = (limit * 1000)%10;
        if(temp != 0){
            setError("Limit must be a valid dollar amount")
            waiting = true;
            return
        }
        if(limit > 1000000){
            setError("Limit cannot exceed $1000000");
            waiting = true;
            return
        }
        if(limit <= 0){
            setError("Limit cannot be less than or equal to 0");
            waiting = true;
            return
        }
        let goalDate = document.getElementById('goalDate').value.trim();
        if(typeof goalDate != 'string'){
            setError("Date Must Be A String")
            waiting = true;
            return
        }
        if(goalDate.length === 0){
            setError("Date Cannot Be An Empty String")
            waiting = true;
            return
        }
        let split = goalDate.split("/");
        console.log(split)
        if (split.length != 3 || split[0].length !== 2 || split[1].length !== 2 || split[2].length != 4) {
            setError("Date must be in the form MM/DD/YYYY");
            waiting = true;
            return
        }
        if(parseInt(split[2]) > 2050){
			setError("Years not accepted past 2050");
            waiting = true;
            return	
		}
        let parsedDate = parse(goalDate, 'MM/dd/yyyy', new Date());

        if (!isValid(parsedDate)) {
            setError("Date must be a valid date");
            waiting = true;
            return
        }
        if (isBefore(parsedDate, startOfDay(new Date())) ) {
            setError("Date must be today's date or a future date");
            waiting = true;
            return
        }
        if(waiting){
            return;
        }

        await axios.patch(`http://localhost:3000/userProfile/${goal.userId}/${goal._id}`, 
            {
                id: goal,
                userId: goal.userId,
                title: title,
                description: description,
                category: category.value,
                limit: limit,
                goalDate: goalDate,
                successful: goal.successful,
                expenses: goal.expenses,
                likes: goal.likes,
                seedingBool: goal.seedingBool
            }
        )
        document.getElementById('editGoal').reset()
        props.close()

    }

    if(goal === null || categories === null || fillDate === ''){
        return (
            <div>Loading...</div>
        )
    }else{
        console.log(fillDate)
        return (
            <div>
                {error && 
                    <h3 className='error'>{error}</h3>
                }
                <form id="editGoal" onSubmit={submitGoal}>
                    <label>
                    Title:
                    <br />
                    <input id="title" 
                    ref={(node) => {
                        title = node;
                    }}
                    defaultValue={goal.title}
                    />
                    </label>
                    <p className="input-requirements">Min 3 characters, max 50 characters. Cannot include only special characters.</p>
                    <label>
                    Description:
                    <br />
                    <input id="description" 
                    ref={(node) => {
                        description = node;
                    }}
                    defaultValue={goal.description}
                    />
                    </label>
                    <p className="input-requirements">Min 5 characters, max 200 characters. Cannot include only special characters.</p>
                    <label>
                    Category:
                    <br />
                    <select                     
                        ref={(node) => {
                            category = node;
                        }}
                        defaultValue={goal.category}
                    >
                        {categories.map((category) => {
                            return (
                                <option value={category} key={category}>{category}</option>
                            )
                        })}
                    </select>
                    </label>
                    <br/>
                    <label>
                    Limit:
                    <br />
                    <input id="limit" 
                    ref={(node) => {
                        limit = node;
                    }}
                    defaultValue={goal.limit}
                    />
                    </label>
                    <br/>
                    <label>
                    Date:
                    <br />
                    <input id="goalDate" defaultValue={fillDate}
                    />
                    </label>
                    <p className="input-requirements">Must be in the format MM/DD/YYYY</p>
                    <br/>
                    <button className='button' type='submit'>Update Goal</button>
                    <button className='button' onClick={()=>props.close()}>Cancel</button>

                </form>
            </div>
        )
    }
}

export default EditGoal