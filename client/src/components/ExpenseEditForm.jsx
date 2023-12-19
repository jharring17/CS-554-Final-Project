import { useState, useEffect } from 'react';
import '../App.css';
import axios from 'axios';
import * as firebase from '../firebase/FirebaseFunctions.js';
import { useThemeProps } from '@mui/material';
import { doGetUID } from '../firebase/FirebaseFunctions';

function ExpenseEditForm(props) {
	const [expense, setExpense] = useState('');
	const [fillDate, setFillDate] = useState('');
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

				let expenseDate = expenseData.data.expense.date;
				console.log(expenseDate);
				let expenseDateComponents = expenseDate.split('/');
				let fillDateValue =
					expenseDateComponents[2] +
					'-' +
					expenseDateComponents[0] +
					'-' +
					expenseDateComponents[1];
				console.log(fillDateValue);
				setFillDate(fillDateValue);
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

		if (description === undefined || amount === undefined || date === undefined) {
			setError('No inputs can be empty.');
			waiting = true;
		}

		if (description === null || amount === null || date === null) {
			setError('No inputs can be empty.');
			waiting = true;
		}

		// Check that form values are not empty.
		if (description.trim() == '') {
			setError('Description is required.');
			waiting = true;
		}
		description = description.trim();

		if (typeof description != 'string') {
			setError('Description must be a string.');
			waiting = true;
		}

		if (typeof date != 'string') {
			setError('Date must be a string.');
			waiting = true;
		}

		if (!/[A-Za-z]/.test(description)) {
			setError(`Description must contain at least one letter`);
			waiting = true;
		}
		if (amount.trim() == '') {
			setError('Amount is required.');
			waiting = true;
		}
		amount = amount.trim();

		if (date.trim() == '') {
			setError('Date is required.');
			waiting = true;
		}
		date = date.trim();

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
			if (amountComponents[1].length != 2 && amountComponents[1].length != 1) {
				console.log('nsklandklas');
				setError(`Must have one or two numbers trailing a decimal.`);
				waiting = true;
			}
		}
		date = date.split('-');
		let curr = new Date();
		let currDay = curr.getDate();
		if (currDay < 10) {
			currDay = `0${currDay}`;
		}
		let currMonth = curr.getMonth() + 1;
		if (currMonth < 10) {
			currMonth = `0${currMonth}`;
		}
		let currYear = curr.getFullYear();
		if (currYear < parseInt(date[0])) {
			//if the expense year is past the current year
			setError('The date cannot be a future date');
			waiting = true;
		} else if (currYear === parseInt(date[0]) && currMonth < parseInt(date[1])) {
			//if the year is the same, expense month is past the current month
			setError('The date cannot be a future date');
			waiting = true;
		} else if (
			currYear === parseInt(date[0]) &&
			currMonth === parseInt(date[1]) &&
			currDay < parseInt(date[2])
		) {
			//if the year and month are the same, but the curr day is past the expense day
			setError('The date cannot be a future date');
			waiting = true;
		}
		if (waiting) {
			return;
		}
		date = date[1] + '/' + date[2] + '/' + date[0];
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
						<input type="date" id="date" defaultValue={fillDate} />
					</label>
					<br />
					<br />
					<button className="button" type="submit" onClick={editExpense}>
						Submit
					</button>
					<button className="button" onClick={() => props.close()}>
						Cancel
					</button>
				</form>
			</div>
		);
	}
}

export default ExpenseEditForm;
