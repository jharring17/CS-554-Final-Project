import React, {useState, useContext, useEffect} from "react"
import {AuthContext} from '../context/AuthContext';
import { doGetUID } from "../firebase/FirebaseFunctions";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {isValid, parse, isBefore, startOfDay} from 'date-fns'

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

        //checking input
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
        //desc
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
        if (!/^[0-9]+(\.[0-9]+)?$/.test(limit)) {
			setError(`Amount field not in proper format`);
			waiting = true;
			return
		}
        limit = parseFloat(limit);
        let temp = (limit * 1000)%10;
        if(temp != 0){
            setError("Limit must be a valid dollar amount");
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
        if(typeof date != "string"){
            setError("Date must be in the form MM/DD/YYYY");
            waiting = true;
            return
        }
        if(date.length === 0){
            setError("Date Cannot Be An Empty String");
            waiting = true;
            return
        }
        let split = date.split("/");
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
        let parsedDate = parse(date, 'MM/dd/yyyy', new Date());
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
        try{
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
        }catch(e){
            setError(e.response.data.error)
            return
        }

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
                        
                        <input id="limit" style={{marginTop: "3px", marginBottom: "8px", padding: "5px 10px"}} placeholder="$" />
                    </label>
                    <p className="input-requirements">Enter monetary value without any commas or dollar signs.</p>
                </div>
                <div className="form-group">
                    <label>
                        Goal Date: 
                        <br/>
                        <input id="date" type='text' placeholder="MM/DD/YYYY" style={{marginTop: "3px", marginBottom: "8px", padding: "5px 10px"}} />
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