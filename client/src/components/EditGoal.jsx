import {React, useState, useEffect} from 'react'
import axios from 'axios'
import { doGetUID } from "../firebase/FirebaseFunctions";

function EditGoal(props){
    const [goal, setGoal] = useState(null);
    const [categories, setCategories] = useState(null);

    let title, description, category, limit, goalDate;

    useEffect( () => {
        setGoal(null)
        setCategories(null)
        async function getGoalInfo(){
            let id = doGetUID();
            let data = await axios.get(`http://localhost:3000/userProfile/${id}/${props.goal}`)
            setGoal(data.data)

            let userData = await axios.get(`http://localhost:3000/user/${id}/getUserInfo`)
            setCategories(userData.data.categories)
        }
        getGoalInfo();
    }, [])

    async function submitGoal(e){
        e.preventDefault();
        //error check the inputs
        
        await axios.patch(`http://localhost:3000/userProfile/${goal.userId}/${goal._id}`, 
            {
                id: goal,
                userId: goal.userId,
                title: title.value,
                description: description.value,
                category: category.value,
                limit: parseFloat(limit.value),
                goalDate: goalDate.value,
                successful: goal.successful,
                expenses: goal.expenses,
                likes: goal.likes,
                seedingBool: goal.seedingBool
            }
        )
        document.getElementById('editGoal').reset()
        alert("Goal Updated")
        props.close()

    }

    if(goal === null || categories === null){
        return (
            <div>Loading...</div>
        )
    }else{
        console.log(goal)
        console.log(categories)
        return (
            <div>
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
                    <input id="goalDate" 
                    ref={(node) => {
                        goalDate = node;
                    }}
                    defaultValue={goal.goalDate}
                    />
                    </label>
                    <br/>

                    <button type='submit'>Update Goal</button>
                </form>
            </div>
        )
    }
}

export default EditGoal