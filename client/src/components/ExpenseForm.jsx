import { useState } from 'react';
import '../App.css';
import axios from 'axios';
import * as firebase from '../firebase/FirebaseFunctions.js';
import { useNavigate } from 'react-router-dom';

// TODO: Make this pass props, so we can pass the goalId.
const goalId = '656e160b398f8720a830e799';
function ExpenseForm() {
	// Define navigate for page redirection.
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		// Prevent default action.
		e.preventDefault();

		// Get the values from the form.
		let userId = firebase.doGetUID();
		let description = document.getElementById('description').value;
		let amount = document.getElementById('amount').value;
		let date = document.getElementById('date').value;
		console.log('Form submitted & values retrieved.');

		// Call the route to add an expense with the form data.
		try {
			await axios.post(`localhost:3000/${userId}/${goalId}`, {
				description: description,
				amount: amount,
				date: date,
			});
		} catch (e) {
			console.log(e);
		}

		// Redirect the user to the account.
		navigate('/account');
	};

	// Return the form.
	return (
		<div className="expenseForm">
			<form>
				<label>
					Description
					<input id="description" />
				</label>
				<br />
				<br />
				<label>
					Amount
					<input id="amount" />
				</label>
				<br />
				<br />
				<label>
					Date
					<input id="date" type="date" />
				</label>
				<br />
				<br />
				<button type="submit" onClick={handleSubmit}>
					Add Expense
				</button>
			</form>
		</div>
	);
}

export default ExpenseForm;
