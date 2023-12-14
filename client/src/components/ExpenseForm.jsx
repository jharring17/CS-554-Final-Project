import { useState } from 'react';
import '../App.css';
import axios from 'axios';
import * as firebase from '../firebase/FirebaseFunctions.js';
import { useThemeProps } from '@mui/material';

function handleCancel(props) {
	props.close();
}

function ExpenseForm(props) {
	// Define navigate for page redirection.
	let [errors, setErrors] = useState([]);
	const handleSubmit = async (e) => {
		// Prevent default action.
		e.preventDefault();

		let errors = [];

		// Get the values from the form.
		let userId = firebase.doGetUID();
		let description = document.getElementById('des').value;
		let amount = document.getElementById('amount').value;
		let date = document.getElementById('date').value;

		// Check that form values are not empty.
		if (description.trim() == '') {
			errors.push('Description is required.');
		}
		if (amount.trim() == '') {
			errors.push('Amount is required.');
		}
		if (date.trim() == '') {
			errors.push('Date is required.');
		}

		// Remove the dollar sign from the amount.
		if (amount.includes('$')) amount = amount.replaceAll('$', '');

		// If the amount contains values that are not numbers, error.
		if (!/^[0-9]+(.[0-9]+)?$/.test(amount)) {
			errors.push(`Error: Inputs must contain positve numbers and decimals.`);
		}

		// If there is a decimal place, there can only be two trailing values.
		if (amount.includes('.')) {
			let amountComponents = amount.split('.');
			if (amountComponents[1].length !== 2) {
				errors.push(`Error: Input must only contain two numbers trailing the decimal.`);
			}
		}

		console.log(errors);
		setErrors(errors);

		// If there are no errors, perform the request.
		if (errors.length === 0) {
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
				document.getElementById('addExpense').reset();
				//alert("Expense Updated")
				props.close();
			} catch (e) {
				console.log(e);
			}
		}
		//document.getElementById('expenseForm').reset();
		//alert('Added Expense');
	};

	// Return the form.
	return (
		<div className="expenseForm">
			<h1>Track an Expense</h1>
			{errors.map((error, index) => {
				return (
					<p key={index} className="error">
						{error}
					</p>
				);
			})}
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
				<button type="submit" onClick={handleCancel}>
					Cancel
				</button>
			</form>
		</div>
	);
}

export default ExpenseForm;
