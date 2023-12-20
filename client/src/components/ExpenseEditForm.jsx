import { useState, useEffect } from 'react';
import '../App.css';
import axios from 'axios';
import * as firebase from '../firebase/FirebaseFunctions.js';
import { useThemeProps } from '@mui/material';
import { doGetUID } from '../firebase/FirebaseFunctions';
import {isValid, parse, isBefore, startOfDay} from 'date-fns'

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
				setFillDate(expenseDate);
			} catch (e) {
				`Cannot get expense`;
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
			setError('No inputs can be empty');
			waiting = true;
			return
		}

		if (description === null || amount === null || date === null) {
			setError('No inputs can be empty');
			waiting = true;
			return
		}

		// Check that form values are not empty.
		if (description.trim() == '') {
			setError('Description is required');
			waiting = true;
			return
		}
		description = description.trim();

		if (typeof description != 'string') {
			setError('Description must be a string');
			waiting = true;
			return
		}

		if (typeof date != 'string') {
			setError('Date must be a string');
			waiting = true;
			return
		}

		if (!/[A-Za-z]/.test(description)) {
			setError(`Description must contain at least one letter`);
			waiting = true;
			return
		}
		if (amount.trim() == '') {
			setError('Amount is required');
			waiting = true;
			return
		}
		if(typeof date != 'string'){
			setError("Date must be in the format MM/DD/YYYY")
			waiting = true;
			return
		}
		amount = amount.trim();
		if (date.trim() == '') {
			setError('Date is required');
			waiting = true;
			return
		}
		date = date.trim();

		// Description can only be 200 characters.
		if (description.length > 200) {
			setError(`Description cannot exceed 200 characters`);
			waiting = true;
			return
		}

        // Description cannot be less than 3 characters.
		if (description.length < 3) {
			setError(`Description must include at least 3 characters.`);
			waiting = true;
			return
		}

		// Check that the amount field only contains numbers and decimals.
		if (!/^[0-9]+(\.[0-9]+)?$/.test(amount)) {
			setError(`Amount field not in proper format`);
			waiting = true;
			return
		}

		// Check that amount is positive, non-zero number.
		if (parseFloat(amount) < 0) {
			setError(`Cannot have a negative amount`);
			waiting = true;
			return
		}
		if (parseFloat(amount) === 0) {
			setError('Amount must be non-zero');
			waiting = true;
			return
		}
		if (parseFloat(amount) > 1000000) {
			setError('Amount is too large');
			waiting = true;
			return
		}
		// If the amount contains a decimal, check for two decimal places.
		if (amount.includes('.')) {
			let amountComponents = amount.split('.');
			if (amountComponents[1].length != 2 && amountComponents[1].length != 1) {
				console.log('nsklandklas');
				setError(`Must have one or two numbers trailing a decimal`);
				waiting = true;
				return
			}
		}
		let split = date.split("/");
        if (split.length != 3 || split[0].length !== 2 || split[1].length !== 2 || split[2].length != 4) {
            setError("Date must be in the form MM/DD/YYYY");
            waiting = true;
            return
        }
		if(parseInt(split[2]) < 1900){
			setError("Years not accepted before 1900");
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
		if (waiting) {
			return;
		}
		try {
			// After all data is validated, try to update the expense.
			// if (user.displayName === displayName.trim() && user.username === username.trim()) {
			// 	setError("Must update at least one field to submit form");
			// 	return;
			// }
			let patchedExpense = await axios.put(
				`http://localhost:3000/user/${uid}/${props.goal}/${expense._id}`,
				{
					description: description,
					amount: parseFloat(amount),
					date: date,
				}
			);
			// console.log('Patched Expense: ', patchedExpense);
		} catch (e) {
			setError(e.response.data.error)
			return
		}
		props.close();
	}

	if (expense === null) {
		return <div>Loading...</div>;
	} else {
		return (
			<div className="editExpenseForm">
				<h1>Edit Expense</h1>
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
					<p className="input-requirements">Max 200 characters. Must include letters.</p>
					<br />
					<label>
						Amount
						<input id="amount" placeholder="$$$" defaultValue={expense.amount} />
					</label>
					<br />
					<br />
					<label>
						Date
						<input id="date" defaultValue={fillDate} />
					</label>
					<p className="input-requirements">Must be in the format MM/DD/YYYY</p>
					<br />
					<br />
					<button className="button" type="submit" onClick={editExpense}>
						Submit
					</button>
					<button className="button" onClick={() => props.close()}>
						Cancel
					</button>
					<br/>
				</form>
			</div>
		);
	}
}

export default ExpenseEditForm;
