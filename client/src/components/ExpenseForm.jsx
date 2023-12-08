import { useState } from 'react';
import './App.css';
import axios from 'axios';
import * as firebase from '../firebase/FirebaseFunctionss.js';

function ExpenseForm({ goalId }) {
	const [formData, setFormData] = useState({
		description: '',
		amount: '',
		date: '',
	});

	const [currentUserFireId, setCurrentUserFireId] = useState('');

	// Get the fireID to generate an expense for a user.
	try {
		// Set the current user's fireID.
		let currentUserFireId = firebase.doGetUID();
		setCurrentUserFireId(currentUserFireId);
	} catch (e) {
		console.log(e);
	}

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log('Form submitted: ', formData);

		// Call the route to add an expense with the form data.
		try {
			axios.post(`localhost:3000/${currentUserFireId}/${goalId}`, {
				description: formData.description,
				amount: formData.amount,
				date: formData.date,
			});
		} catch (e) {
			console.log(e);
		}
	};

	return (
		<div className="expenseForm">
			<form>
				<label>
					Description
					<input
						type="text"
						name="description"
						placeholder="Description"
						value={formData.description}
						onChange={handleChange}
					/>
				</label>
				<label>
					Amount
					<input
						type="number"
						name="amount"
						placeholder="Amount"
						value={formData.amount}
						onChange={handleChange}
					/>
				</label>
				<label>
					Date
					<input
						type="date"
						name="date"
						placeholder="Date"
						value={formData.date}
						onChange={handleChange}
					/>
				</label>
				<button type="submit" onClick={handleSubmit}>
					Add Expense
				</button>
			</form>
		</div>
	);
}

export default ExpenseForm;
