import { useState, useEffect } from 'react';
import '../App.css';
import axios from 'axios';
import * as firebase from '../firebase/FirebaseFunctions.js';
import { useThemeProps } from '@mui/material';
import {isValid, parse, isBefore, startOfDay} from 'date-fns'

function ExpenseForm(props) {
	// Define navigate for page redirection.
	let [error, setError] = useState('');

	useEffect(() => {
		setError('');
	}, []);

	const handleSubmit = async (e) => {
		// Prevent default action.
		e.preventDefault();
		let waiting = false;
		setError('');
		console.log('error: ' + error);
		// Get the values from the form.
		let userId = firebase.doGetUID();
		let description = document.getElementById('des').value;
		let amount = document.getElementById('amount').value;
		let date = document.getElementById('date').value;

		// Error checking for form values.
		// Check that form values are not empty.
		if (description === undefined || amount === undefined || date === undefined) {
			setError('No inputs can be empty.');
			waiting = true;
		}

		if (description === null || amount === null || date === null) {
			setError('No inputs can be empty.');
			waiting = true;
		}

		if (description.trim() == '') {
			setError('Description is required.');
			waiting = true;
		}
		description = description.trim();

		if (!/[A-Za-z]/.test(description)) {
			setError(`Description must contain at least one letter`);
			waiting = true;
		}

		if (typeof description != 'string') {
			setError('Description must be a string.');
		}

		if (amount.trim() == '') {
			setError('Amount is required.');
			waiting = true;
		}
		if(typeof date != "string"){
			setError("Date must be in the form MM/DD/YYYY")
		}
		amount = amount.trim();

		if (typeof date != 'string') {
			setError('Date must be a string.');
			waiting = true;
		}
		if (date.trim() == '') {
			setError('Date is required.');
			waiting = true;
		}
		date = date.trim();

		// Description can only be 200 characters.
		if (description.length > 200) {
			console.log(description.length);
			setError(`Description cannot exceed 200 characters.`);
			waiting = true;
		}

		// Check that the amount field only contains numbers and decimals.
		if (!/^[0-9]+(\.[0-9]+)?$/.test(amount)) {
			console.log('here');
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
			setError('Amount cannot exceed $1000000');
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
        let split = date.split("/");
        if (split.length != 3 || split[0].length !== 2 || split[1].length !== 2 || split[2].length != 4) {
            setError("Date must be in the form MM/DD/YYYY");
            waiting = true;
            return
        }
        let parsedDate = parse(date, 'MM/dd/yyyy', new Date());

        if (!isValid(parsedDate)) {
            setError("Date must be a valid date");
            waiting = true;
            return
        }
        if (isBefore(startOfDay(new Date()), parsedDate)) {
            setError("Date must be today's date or a past date");
            waiting = true;
            return
        }
		if(waiting){
			return
		}
		
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
				setError(e)
				return
			}

		//}
	};

	// Return the form.
	return (
		<div className="expenseForm">
			<h1>Track an Expense</h1>
			<p className="error">{error}</p>
			<form id="addExpense">
				<div className="form-group">
					<label>
						Description:
						<br />
						<input id="des" placeholder="I bought..." />
					</label>
					<p className="input-requirements">Max 200 characters. Must include letters.</p>
				</div>

				<div className="form-group">
					<label>
						Amount:
						<br />
						<input id="amount" placeholder="$" />
					</label>
				</div>

				<div className="form-group">
					<label>
						Date:
						<br/>
						<input id="date" />

					</label>
				</div>

				<br />

				<button className="button" type="submit" onClick={handleSubmit}>
					Add Expense
				</button>
				<button className="button" onClick={() => props.close()}>
					Cancel
				</button>
			</form>
		</div>
	);
}

export default ExpenseForm;
