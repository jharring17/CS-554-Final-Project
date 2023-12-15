import { useState } from 'react';
import '../App.css';
import axios from 'axios';
import * as firebase from '../firebase/FirebaseFunctions.js';
import { useThemeProps } from '@mui/material';

function ExpenseForm(props) {
	// Define navigate for page redirection.
	let [error, setError] = useState('');

	const handleSubmit = async (e) => {
		// Prevent default action.
		e.preventDefault();

		// Get the values from the form.
		let userId = firebase.doGetUID();
		let description = document.getElementById('des').value;
		let amount = document.getElementById('amount').value;
		let date = document.getElementById('date').value;

		// Error checking for form values.
		try {
			// Check that form values are not empty.
			if (description.trim() == '') {
				throw 'Description is required.';
			}
			if (amount.trim() == '') {
				throw 'Amount is required.';
			}
			if (date.trim() == '') {
				throw 'Date is required.';
			}

			// Description can only be 500 characters.
			if (description.length > 500) {
				throw `Description cannot exceed 500 characters.`;
			}

			// Check that the amount field only contains numbers and decimals.
			if (!/^[0-9]+(\.[0-9]+)?$/.test(amount)) {
				throw `Amount field can only contain numbers and decimals.`;
			}

			// Check that amount is positive, non-zero number.
			if (parseFloat(amount) < 0) {
				throw `Cannot have a negative amount.`;
			}
			if (parseFloat(amount) === 0) {
				throw 'Amount must be non-zero.';
			}

			// If the amount contains a decimal, check for two decimal places.
			if (amount.includes('.')) {
				let amountComponents = amount.split('.');
				if (amountComponents[1].length !== 2) {
					throw `Must have two numbers trailing a decimal.`;
				}
			}
		} catch (e) {
			console.log(e);
			setError(e);
		}

		// If there are no errors, perform the request.
		if (error === '') {
			// Format date value from form for submission
			date = date.split('-');
			date = date[1] + '/' + date[2] + '/' + date[0];

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
		}
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
