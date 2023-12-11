import { React } from 'react'
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  Grid,
} from '@mui/material';
import axios from 'axios'
import { doGetUID } from "../firebase/FirebaseFunctions";
import EditGoal from './EditGoal';

function GoalCard(props){
    const [goal, setGoal] = useState({});
    const [showExpenses, setShowExpenses] = useState(false)
    const [showEdit, setShowEdit] = useState(false);

    function openEdit(){
      setShowEdit(true)
    }
    function handleClose(){
      setShowEdit(false)
    }

    useEffect( () => {
      setShowExpenses(false)
      async function getGoalInfo(){
        let id = doGetUID();
        let data = await axios.get(`http://localhost:3000/userProfile/${id}/${props.id}`)
        setGoal(data.data)
        if(data.data.expenses.length != 0){
          setShowExpenses(true);
        }
      }
      getGoalInfo();
    }, [showEdit])

    return (
      <>
        <Grid item sm={4} md={3} lg={2.25} alignItems={"center"} key={props.id}>
          <Card
            variant='outlined'
            sx={{maxWidth: 300, height: 'auto', marginLeft: 'auto', marginRight: 'auto'
            }}
          >
              <h2>{goal.title}</h2>
              <h3>{goal.description}</h3>
              <br/>
              <h4>Goal Category: {goal.category}</h4>
              <h4>I want to spend at most ${goal.limit} by {goal.goalDate}</h4>

              {showExpenses && 
                <>
                  <h4>Expenses:</h4>
                  {goal.expenses.map((expense) => {
                    return(
                      <>
                        <h5>{expense.description}</h5>
                        <br/>
                        <h6>Spent ${expense.amount} on {expense.date}</h6>
                      </>
                    )
                  })}
                </>
              }
              <button onClick={()=>{openEdit()}}>Edit Goal</button>
              {showEdit && <EditGoal isOpen={openEdit} close={handleClose} goal={goal._id} />}

              <button onClick={()=>{alert('will add expense for goal here')}}>Add Expense</button>
              <br/>
              <br/>
          </Card>
        </Grid>    
        <br/>
      </>

    )
}

export default GoalCard