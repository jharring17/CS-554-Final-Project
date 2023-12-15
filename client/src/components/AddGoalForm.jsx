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
            let data = await axios.get(`http://localhost:3000/user/${id}/getUserInfo`)
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
        if(date.length === 0){
            setError("Date Cannot Be An Empty String");
            waiting = true;
        }
        let result = dateChecker(date);
        if(result != date){
            setError(result);
            waiting = true;
        }
        // if(error != null){
        //     return
        // }
        if(waiting){
            return;
        }

        let data = await axios.post(`http://localhost:3000/userProfile/${userId}/newGoal`, 
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
            <form id="addGoal" onSubmit={submitGoal}>
                <label>
                    Title: <input id="title" style={{marginTop: "3px", marginBottom: "8px", padding: "5px 10px"}} required />
                </label>
                <br/>
                <label>
                    Description: <input id="description" style={{marginTop: "3px", marginBottom: "8px", padding: "5px 10px"}} required />
                </label>
                <br/>
                <label>
                    Category: <select id="category" style={{marginTop: "3px", marginBottom: "8px", padding: "5px 10px"}}>
                        <option>...</option>
                        {categories.map((category) => {
                            return (
                                <option value={category} key={category}>
                                {category}
                            </option>
                            )
                        })}
                    </select>
                </label>
                <br/>
                <label>
                    Budget for this Goal: $<input id="limit" style={{marginTop: "3px", marginBottom: "8px", padding: "5px 10px"}} required />
                </label>
                <br/>
                <label>
                    Goal Date (mm/dd/yyyy): <input id="date" style={{marginTop: "3px", marginBottom: "8px", padding: "5px 10px"}} required />
                </label>
                <br/>
                <button className="button" type="submit">Create Goal</button>
            </form>
        </div>
        </div>
 
    )
}

export default AddGoal