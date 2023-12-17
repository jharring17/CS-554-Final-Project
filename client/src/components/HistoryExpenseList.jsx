import { useState, useEffect } from 'react';
import '../App.css';
import axios from 'axios';
import * as firebase from '../firebase/FirebaseFunctions.js';
import { useThemeProps } from '@mui/material';
import { doGetUID } from '../firebase/FirebaseFunctions';

function HistoryExpenseList(props) {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    setExpenses([]);

    async function getExpenses() {
        setExpenses(props.expenses);
    }

    getExpenses();
  }, [props.expenses]);

  if (expenses === null) {
    return <div>Loading...</div>;
  } else {
    return (
      <div className="editExpenseForm">
        <h3>Expenses</h3>
        <p className="error">{error}</p>
        {expenses.map((expense) => (
            <div key={expense._id}>
                <p>{expense.description}: spent ${expense.amount} on {expense.date}</p>
            </div>
        ))}
      </div>
    );
  }
}

export default HistoryExpenseList;
