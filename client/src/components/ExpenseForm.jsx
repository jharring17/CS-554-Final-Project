import { useState } from 'react';
import '../App.css';
import axios from 'axios';
import * as firebase from '../firebase/FirebaseFunctions.js';
import { useNavigate } from 'react-router-dom';

function ExpenseForm({ goalId }) {
	// Define navigate for page redirection.
	const navigate = useNavigate();
	let [errors, setErrors] = useState([]);

	const handleSubmit = async (e) => {
		// Prevent default action.
		e.preventDefault();

		let errors = [];

		// Get the values from the form.
		let userId = firebase.doGetUID();
		let description = document.getElementById('description').value;
		let amount = document.getElementById('amount').value;
		let date = document.getElementById('date').value;

		console.log('userId:', userId);
		console.log('goalId:', goalId);

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

		// // Format the amount value from form for submission.
		// const isValidAmount = /^\$?[0-9]+(\.[0-9]{0,2})/.test(amount);
		// if (!isValidAmount) {
		// 	errors.push('Invalid amount formatting.');
		// }

		// // Check that the amount is a valid number with up to two decimal places.
		// if (amount.includes('.')) {
		// 	let splitAmount = amount.split('.');
		// 	if (splitAmount[1].length > 2) {
		// 		errors.push('Amount must be a valid number with up to two decimal places.');
		// 	}
		// }

		// // Remove the dollar sign from the amount.
		// if (amount.includes('$')) amount = amount.replaceAll('$', '');

		setErrors(errors);

		// If there are no errors, perform the request.
		if (errors.length === 0) {
			// Format date value from form for submission
			date = date.split('-');
			date = date[1] + '/' + date[2] + '/' + date[0];
			console.log('Date: ', date);

			// Format the amount value from form for submission.
			amount = parseFloat(amount);
			console.log('Amount: ', amount);

			// Call the route to add an expense with the form data.
			try {
				let expense = await axios.post(`http://localhost:3000/user/${userId}/${goalId}`, {
					description: description,
					amount: amount,
					date: date,
				});
				console.log('Posted expense: ', expense);
			} catch (e) {
				console.log(e);
			}

			// Redirect the user to the account.
			navigate('/account');
		}
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
			<form>
				<label>
					Description
					<input id="description" placeholder="I bought..." />
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
			</form>
		</div>
	);
}

export default ExpenseForm;
