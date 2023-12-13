import { useEffect, useState } from 'react';
// import './App.css';
import axios from 'axios';
import * as firebase from '../firebase/FirebaseFunctions.js';

function ExpenseForm(props) {
	const [formData, setFormData] = useState({
		description: '',
		amount: '',
		date: '',
	});
	const [currentUserFireId, setCurrentUserFireId] = useState('');

	useEffect(()=> {
		// Get the fireID to generate an expense for a user.
		try {
			// Set the current user's fireID.
			let currentUserFireId = firebase.doGetUID();
			setCurrentUserFireId(currentUserFireId);
		} catch (e) {
			console.log(e);
		}
	}, [])

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		// Call the route to add an expense with the form data.
		try {
			axios.post(`localhost:3000/userProfile/${currentUserFireId}/${props.goal}`, {
				description: formData.description,
				amount: formData.amount,
				date: formData.date,
			});
		} catch (e) {
			console.log(e);
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
