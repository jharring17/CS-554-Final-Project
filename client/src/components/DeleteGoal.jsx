import {React, useState, useEffect} from 'react'
import axios from 'axios'
import { doGetUID } from "../firebase/FirebaseFunctions";
function DeleteGoal(props){

    async function deleteGoal(){
        console.log(props.goalId)
        let id = doGetUID();
        let data = await axios.delete(`http://54.175.184.234:3000/userProfile/${id}/${props.goalId}`)
        console.log(data)
        alert("Goal deleted")
        props.close()
    }

    return(
        <div>
            <p>Are you sure you want to delete?</p>
            <button onClick={()=> deleteGoal()}>Yes</button>
            <button onClick={()=>props.close()}>No</button>
        </div>
    )
}

export default DeleteGoal;

