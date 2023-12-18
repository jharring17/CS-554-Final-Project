import {React, useState, useEffect} from 'react'
import axios from 'axios'
import { doGetUID } from "../firebase/FirebaseFunctions";

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
            currDate = currDate.split('/')
            currDate = currDate[2] + '-' + currDate[0] + '-' + currDate[1];
            setFillDate(currDate)

            let userData = await axios.get(`http://localhost:3000/user/${id}/getUserInfo`)
            setCategories(userData.data.categories)
        }
        getGoalInfo();
    }, [])

    function dateChecker(date){
        for(let i = 0; i < date.length; i++){
            if(date.charCodeAt(i) != 47){
                if(date.charCodeAt(i) < 48 || date.charCodeAt(i) > 57){
                    return "Date must be in the MM/DD/YYYY format"
                }
            }
        }

        if(date[2] != '/' && date[5] != '/') return `Date needs to be in the format 'MM/DD/YYYY'`
        let validMonths = ['01','02','03','04','05','06','07','08', '09', '10', '11', '12'];
        let present = false;
        //make sure the month matches 1 valid month
        for(let i = 0; i < validMonths.length; i++){
          if(validMonths[i] === date.substring(0,2)){
            present = true;
            break;
          }
        }
        if(present === false) return "The month isn't valid for date";
    
        //check to make sure the month lines up with dates
        if(date.substring(0,2) === "04" || date.substring(0,2) === "06" || date.substring(0,2) === "09" || date.substring(0,2) === "11"){
          if(parseInt(date.substring(3,5)) > 30 || parseInt(date.substring(3,5)) < 0) return `Invalid day for date`;
        }
        else if(date.substring(0,2) === "01" || date.substring(0,2) === "03" || date.substring(0,2) === "05" || date.substring(0,2) === "07" || date.substring(0,2) === "08" || date.substring(0,2) === "10" || date.substring(0,2) === "12"){
          if(parseInt(date.substring(3,5)) > 31 || parseInt(date.substring(3,5)) < 0) return `Invalid day for date`;
        }
        else{
          if(parseInt(date.substring(3,5)) > 28 || parseInt(date.substring(3,5)) < 0) return `Invalid day for date`;
        }
        //used this link to get the current date: https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
        let currDate = new Date();
        let month = currDate.getMonth() + 1;
        let day = currDate.getDate();
        let year = currDate.getFullYear();
    
        //now we have to compare to make sure that the goalDate is later than the curr date
        let goalMonth = parseInt(date.substring(0, 2));
        let goalDay = parseInt(date.substring(3,5));
        let goalYear = parseInt(date.substring(6));
        if(year > goalYear) return `Goal Date must be a future date (invalid year)`
        if(year === goalYear && month > goalMonth) return `Goal Date must be a future date (invalid month)`
        if(year === goalYear && month === goalMonth && day > goalDay) return `Goal Date must be a future date (invalid day)`
    
        return date;
    }

    async function submitGoal(e){
        e.preventDefault();

        let waiting = false;
        let title = document.getElementById('title').value.trim();
        //title
        if(typeof title != 'string') {
            setError(`Title must be a string`);
            waiting = true;
        }
        title = title.trim();
        if(title.length === 0) {
            setError(`Title cannot be empty`);
            waiting = true;
        }
        if (title.length < 3) {
            setError(`Title length must be at least 3`);
            waiting = true;
        }
        if (title.length > 50) {
            setError(`Title length cannot exceed 50 characters`);
            waiting = true;
        }
        if (!/[A-Za-z]/.test(title)) {
            setError(`Title must contain at least one letter`);
            waiting = true;
        }
        if (!/^[A-Za-z0-9:&$%-]/.test(title)) {
            setError(`Title is invalid`);
            waiting = true;
        }
        if(title.length === 0){
            setError("Title Cannot Be An Empty String")
            waiting = true;
        }
        //desc
        let description = document.getElementById('description').value.trim();
        if(typeof description != 'string') {
            setError(`Description must be a string`);
            waiting = true;
        }
        description = description.trim();
        if(description.length === 0) {
            setError(`Description cannot be empty`);
            waiting = true;
        }
        if (description.length < 5) {
            setError(`Description length must be at least 5`);
            waiting = true;
        }
        if (description.length > 200) {
            setError(`Description length cannot exceed 200 characters`);
            waiting = true;
        }
        if (!/[A-Za-z]/.test(description)) {
            setError(`Description must contain at least one letter`);
            waiting = true;
        }

        let limit = document.getElementById('limit').value.trim();
        limit = parseFloat(limit);
        let temp = (limit * 1000)%10;
        if(temp != 0){
            setError("Limit must be a valid dollar amount")
            waiting = true;
        }
        if(limit > 1000000){
            setError("Limit cannot exceed $1000000");
            waiting = true;
        }
        let goalDate = document.getElementById('goalDate').value.trim();
        //change the format of the date to check it
        goalDate = goalDate.split('-')
        goalDate = goalDate[1] + '/' + goalDate[2] + '/' + goalDate[0];
        if(goalDate.length === 0){
            setError("Date Cannot Be An Empty String")
            waiting = true;
        }
        // let result = dateChecker(goalDate);
        // if(result != goalDate){
        //     setError(result)
        //     waiting = true;
        // }
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
                    <h3 className='error'>Error: {error}</h3>
                }
                <form id="editGoal" onSubmit={submitGoal}>
                    <label>
                    Title of Goal:
                    <br />
                    <input id="title" 
                    ref={(node) => {
                        title = node;
                    }}
                    defaultValue={goal.title}
                    />
                    </label>
                    <br/>
                    <label>
                    Goal Description:
                    <br />
                    <input id="description" 
                    ref={(node) => {
                        description = node;
                    }}
                    defaultValue={goal.description}
                    />
                    </label>
                    <br/>                    
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
                    <input id="goalDate" type="date" defaultValue={fillDate}
                    // ref={(node) => {
                    //     goalDate = node;
                    // }}
                    // defaultValue={goal.goalDate}
                    />
                    </label>
                    <br/>
                    <button className='button' type='submit'>Update Goal</button>
                    <button className='button' onClick={()=>props.close()}>Cancel</button>

                </form>
            </div>
        )
    }
}

export default EditGoal