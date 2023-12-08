import React from 'react';
import SignOutButton from './SignOut';
import { Link } from 'react-router-dom';
import '../App.css';
import ChangePassword from './ChangePassword';

function Account() {
	return (
		<div className="card">
			<h2>Dashboard</h2>
			<Link to="/createCategory">Create Category</Link>
			<br />
			<Link to="/makeGoal">Add goal</Link>
			<br />
			<Link to="/reportExpense">Report Expense</Link>
			<br />
			<Link>Edit Profile</Link>
			<br />
			{/* <ChangePassword /> */}
			<SignOutButton />
		</div>
	);
}

export default Account;
