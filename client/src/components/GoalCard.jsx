import { React } from 'react'
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
import ExpenseForm from './ExpenseForm';
import Expense from './Expense';

function GoalCard(props){
    const [goal, setGoal] = useState({});
    const [showExpenses, setShowExpenses] = useState(false)
    const [showEdit, setShowEdit] = useState(false);
    const [showExpenseForm, setShowExpenseForm] = useState(false);

    function openEdit(){
      setShowEdit(true)
    }
    function openExpense(){
      setShowExpenseForm(true);
    }
    function handleClose(){
      setShowEdit(false)
      setShowExpenseForm(false)
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
                    console.log(goal._id)
                    return <Expense key={expense} expense={expense} goal={goal._id} />
                  })}
                </>
              }
              <button onClick={()=>{openEdit()}}>Edit Goal</button>
              {showEdit && <EditGoal isOpen={openEdit} close={handleClose} goalId ={goal._id} />}
              <button onClick={()=>{openExpense()}}>Add Expense</button>
              {showExpenseForm && <ExpenseForm isOpen={openExpense} close={handleClose} goalId={goal._id} />}
              <br/>
              <br/>
          </Card>
        </Grid>    
        <br/>
      </>

    )
}

export default GoalCard