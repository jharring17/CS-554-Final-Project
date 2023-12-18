import React, {useState, useContext, useEffect} from "react"
import {AuthContext} from '../context/AuthContext';
import { doGetUID } from "../firebase/FirebaseFunctions";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function AddGoal({closeForm}){
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    // const navigate = useNavigate();

    useEffect( ()=>{
        async function getUserInfo(){
            let id = doGetUID();
            let data = await axios.get(`http://54.175.184.234:3000/user/${id}/getUserInfo`)
            setCategories(data.data.categories)
        }
        getUserInfo()
        }, []
    )

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
        setError(null)
        e.preventDefault();
        let waiting = false;

        let userId = doGetUID();
        let title = document.getElementById('title').value.trim();
        let description = document.getElementById('description').value.trim();
        let category = document.getElementById('category').value.trim();
        let limit = document.getElementById('limit').value.trim();
        let date = document.getElementById('date').value.trim();

        if(title === null || description === null || category === null || limit === null || date === null){
            setError("No inputs can be empty")
        }
        if(title === undefined || description === undefined || category === undefined || limit === undefined || date === undefined){
            setError("No inputs can be empty")
        }
        //change the format of the date to check it
        date = date.split('-')
        date = date[1] + '/' + date[2] + '/' + date[0];

        //checking input
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
        //desc
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

        limit = parseFloat(limit);
        let temp = (limit * 1000)%10;
        if(temp != 0){
            setError("Limit must be a valid dollar amount");
            waiting = true;
        }
        if(limit > 1000000){
            setError("Limit cannot exceed $1000000");
            waiting = true;
        }
        if(date.length === 0){
            setError("Date Cannot Be An Empty String");
            waiting = true;
        }
        let result = dateChecker(date);
        if(result != date){
            setError(result);
            waiting = true;
        }
        if(waiting){
            return;
        }

        let data = await axios.post(`http://54.175.184.234:3000/userProfile/${userId}/newGoal`, 
            {
                userId: userId,
                title: title, 
                description: description, 
                category: category,
                limit: parseFloat(limit), 
                goalDate: date
            }
        )
        closeForm()
    } 
    return(
        <div>
       {error && 
        <p className='error'>{error}</p>
        }
        <div>
            <h1>Make a New Goal!</h1>
            <form id="addGoal" className='form' onSubmit={submitGoal}>
                <div className='form-group'>
                    <label>
                        Title: 
                        <br/>
                        <input id="title" style={{marginTop: "3px", marginBottom: "8px", padding: "5px 10px"}} />
                    </label>
                    <p className="input-requirements">Min 3 characters, max 50 characters. Cannot include only special characters.</p>
                </div>
                <div className="form">
                    <div className="form-group"></div>
                    <label>
                        Description: 
                        <br/>
                        <input id="description" style={{marginTop: "3px", marginBottom: "8px", padding: "5px 10px"}} />
                    </label>
                    <p className="input-requirements">Min 5 characters, max 200 characters. Cannot include only special characters.</p>
                </div>
                <div className='form-group'>
                    <label>
                        Category: 
                        <br/>
                        <select id="category" style={{marginTop: "3px", marginBottom: "8px", padding: "5px 10px"}}>
                            {categories.map((category) => {
                                return (
                                    <option value={category} key={category}>
                                    {category}
                                </option>
                                )
                            })}
                        </select>
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        Budget for this Goal:
                        <br/>
                        $
                        <input id="limit" style={{marginTop: "3px", marginBottom: "8px", padding: "5px 10px"}} />
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        Goal Date: 
                        <br/>
                        <input id="date" type="date" style={{marginTop: "3px", marginBottom: "8px", padding: "5px 10px"}} />
                    </label>
                    <p className="input-requirements">Must be in the format MM/DD/YYYY</p>
                </div>

                <button className="button" type="submit">Create Goal</button>
            </form>
        </div>
        </div>
 
    )
}

export default AddGoal