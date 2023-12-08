import React, {useState, useContext} from "react"
import {AuthContext} from '../context/AuthContext';
import { doGetUID } from "../firebase/FirebaseFunctions";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function AddGoal(){
    const [categories, setCategories] = useState([])
    const navigate = useNavigate();

    async function getUserInfo(){
        let id = doGetUID();
        let data = await axios.get(`http://localhost:3000/user/${id}/getUserInfo`)
        setCategories(data.data.categories)
    }
    async function submitGoal(e){
        e.preventDefault();
        let userId = doGetUID();
        let title = document.getElementById('title').value
        let description = document.getElementById('description').value;
        let category = document.getElementById('category').value
        let limit = document.getElementById('limit').value
        let date = document.getElementById('date').value

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
        navigate('/account')
    } 
    getUserInfo()
    return(
        <div>
            <h1>Make a New Goal!</h1>
            <form id="addGoal" onSubmit={submitGoal}>
                <label>
                    Title: <input id="title" required />
                </label>
                <br/>
                <label>
                    Description: <input id="description" required />
                </label>
                <br/>
                <label>
                    Category:  
                    <select id="category">
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
                    Budget for this Goal: $<input id="limit" required />
                </label>
                <br/>
                <label>
                    Goal Date (mm/dd/yyyy): <input id="date" required />
                </label>
                <br/>
                <button type="submit">Create Goal</button>
            </form>
        </div>
    )
}

export default AddGoal