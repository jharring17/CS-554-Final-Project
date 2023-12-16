import { useState, useEffect } from 'react';
import '../App.css';
import axios from 'axios';
import * as firebase from '../firebase/FirebaseFunctions.js';
import { useThemeProps } from '@mui/material';
import { doGetUID } from '../firebase/FirebaseFunctions';

function ExpenseEditForm(props) {
	const [expense, setExpense] = useState('');
	const [error, setError] = useState('');

	let description, amount, date;

	useEffect(() => {
		setError('');
		setExpense('');
		async function getExpense() {
			try {
				let uid = doGetUID();
				let expenseData = await axios.get(
					`http://localhost:3000/user/${uid}/${props.goal}/${props.expense}`
				);
				console.log('This is the fetched expense: ', expenseData);
				setExpense(expenseData.data.expense);
			} catch (e) {
				`Error: cannot get expense.`;
			}
		}
		getExpense();
	}, []);

	async function editExpense(e) {
		// Prevent the default action.
		e.preventDefault();

		// Get the values from the form.
		let uid = doGetUID();
		let description = document.getElementById('des').value.trim();
		let amount = document.getElementById('amount').value.trim();
		let date = document.getElementById('date').value.trim();

		// Error checking for form values.
		let waiting = false;

			// Check that form values are not empty.
			if (description.trim() == '') {
				setError('Description is required.');
				waiting = true;
			}
			if (amount.trim() == '') {
				setError('Amount is required.');
				waiting = true;
			}
			if (date.trim() == '') {
				setError('Date is required.');
				waiting = true;
			}
			// Description can only be 200 characters.
			if (description.length > 200) {
				setError(`Description cannot exceed 200 characters.`);
				waiting = true;
			}

			// Check that the amount field only contains numbers and decimals.
			if (!/^[0-9]+(\.[0-9]+)?$/.test(amount)) {
				setError(`Amount field can only contain numbers and decimals.`);
				waiting = true;
			}

			// Check that amount is positive, non-zero number.
			if (parseFloat(amount) < 0) {
				setError(`Cannot have a negative amount.`);
				waiting = true;
			}
			if (parseFloat(amount) === 0) {
				setError('Amount must be non-zero.');
				waiting = true;
			}
			if (parseFloat(amount) > 1000000) {
				setError('Amount must be non-zero.');
				waiting = true;
			}
			// If the amount contains a decimal, check for two decimal places.
			if (amount.includes('.')) {
				let amountComponents = amount.split('.');
				if (amountComponents[1].length !== 2) {
					setError(`Must have two numbers trailing a decimal.`);
					waiting = true;
				}
			}
			if(waiting){
				return;
			}
			// Update the date.
			date = date.split('-');
			date = date[1] + '/' + date[2] + '/' + date[0];

            //TODO: Error checking so you cannot make a day after the goalCompleted date.

			try {
				// After all data is validated, try to update the expense.
				console.log('Getting Expense UserId: ', uid);
				console.log('Getting Goal Props: ', props.goal);
				console.log('Getting Expense Props: ', expense._id);
				let patchedExpense = await axios.put(
					`http://localhost:3000/user/${uid}/${props.goal}/${expense._id}`,
					{
						description: description,
						amount: parseFloat(amount),
						date: date,
					}
				);
				console.log('Patched Expense: ', patchedExpense);
			} catch (e) {
				console.log(e);
			}
			props.close();
	}

	if (expense === null) {
		return <div>Loading...</div>;
	} else {
		return (
			<div className="editExpenseForm">
				<h1>Track an Expense</h1>
				<p className="error">{error}</p>
				<form id="addExpense">
					<label>
						Description
						<input
							id="des"
							placeholder="I bought..."
							defaultValue={expense.description}
						/>
					</label>
					<br />
					<br />
					<label>
						Amount
						<input id="amount" placeholder="$$$" defaultValue={expense.amount} />
					</label>
					<br />
					<br />
					<label>
						Date
						<input type="date" id="date" defaultValue={expense.date} />
					</label>
					<br />
					<br />
					<button type="submit" onClick={editExpense}>
						Submit
					</button>
					<button onClick={() => props.close()}>Cancel</button>
				</form>
			</div>
		);
	}
}

export default ExpenseEditForm;
