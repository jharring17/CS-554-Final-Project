import { useState, useEffect } from 'react';
import '../App.css';
import axios from 'axios';
import * as firebase from '../firebase/FirebaseFunctions.js';
import { useThemeProps } from '@mui/material';

function ExpenseForm(props) {
	// Define navigate for page redirection.
	let [error, setError] = useState('');

	useEffect(()=> {
		setError('')
	}, [])

	const handleSubmit = async (e) => {
		// Prevent default action.
		e.preventDefault();
		let waiting = false;
		setError('')
		console.log("error: " + error)
		// Get the values from the form.
		let userId = firebase.doGetUID();
		let description = document.getElementById('des').value;
		let amount = document.getElementById('amount').value;
		let date = document.getElementById('date').value;

		// Error checking for form values.
		// Check that form values are not empty.
		if (description.trim() == '') {
			setError('Description is required.')
			waiting = true;
		}
		if (!/[A-Za-z]/.test(description)) {
            setError(`Description must contain at least one letter`);
            waiting = true;
        }
		if (amount.trim() == '') {
			setError('Amount is required.')
			waiting = true;
		}
		if (date.trim() == '') {
			setError('Date is required.')
			waiting = true;
		}
		// Description can only be 200 characters.
		if (description.length > 200) {
			console.log(description.length)
			setError(`Description cannot exceed 200 characters.`)
			waiting = true;
		}

		// Check that the amount field only contains numbers and decimals.
		if (!/^[0-9]+(\.[0-9]+)?$/.test(amount)) {
			console.log("here")
			setError(`Amount field can only contain numbers and decimals.`)
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
		if(parseFloat(amount) > 1000000){
			setError('Amount cannot exceed $1000000')
			waiting = true;
		}

		// If the amount contains a decimal, check for two decimal places.
		if (amount.includes('.')) {
			let amountComponents = amount.split('.');
			if (amountComponents[1].length !== 2 && amountComponents[1].length != 1) {
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
		if(waiting){
			return
		}
		//format the date
		date = date[1] + '/' + date[2] + '/' + date[0];
		
		// If there are no errors, perform the request.
		// if (error === '') {
			// Format the amount value from form for submission.
			amount = parseFloat(amount);
			console.log('Amount: ', amount);

			// Call the route to add an expense with the form data.
			try {
				console.log('User ID: ', userId);
				console.log('Goal ID: ', props.goalId);
				let expense = await axios.post(
					`http://localhost:3000/user/${userId}/${props.goalId}`,
					{
						description: description,
						amount: amount,
						date: date,
					}
				);
				console.log('Posted expense: ', expense);
				document.getElementById('addExpense').reset()
				props.close()
			} catch (e) {
				console.log(e);
			}
		//}
	};

	// Return the form.
	return (
		<div className="expenseForm">
			<h1>Track an Expense</h1>
			<p className="error">{error}</p>
			<form id="addExpense">
				<label>
					Description
					<input id="des" placeholder="I bought..." />
				</label>
				<br />
				<br />
				<label>
					Amount
					<input id="amount" placeholder="$$$" />
				</label>
				<br />
				<br />
				<label>
					Date
					<input type="date" id="date" />
				</label>
				<br />
				<br />
				<button type="submit" onClick={handleSubmit}>
					Add Expense
				</button>
				<button onClick={() => props.close()}>Cancel Expense</button>
			</form>
		</div>
	);
}

export default ExpenseForm;
