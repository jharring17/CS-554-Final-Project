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
import ExpenseForm from './ExpenseForm';

function Expense(props){
    const [expenseInfo, setExpenseInfo] = useState()
    useEffect(()=> {
        async function getExpense(id){
            let uid = doGetUID();
            let expenseData = await axios.get(`http://localhost:3000/user/${uid}/${props.goal}/${props.expense}`)
            setExpenseInfo(expenseData.data.expense)
        }
        getExpense(props.expense);
    }, [])


      if(!expenseInfo){
        return <>Loading...</>
      }else{
        return(
            <div>
              <h5>{expenseInfo.description}: spent ${expenseInfo.amount} on {expenseInfo.date}</h5>
            </div>
          )   
      }
 
}

export default Expense