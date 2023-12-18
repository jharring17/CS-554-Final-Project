import { React } from 'react';
import { useState, useEffect } from 'react';
import { Card, Grid, typographyClasses } from '@mui/material';
import axios from 'axios';
import { doGetUID } from '../firebase/FirebaseFunctions';
import EditGoal from './EditGoal';
import ExpenseForm from './ExpenseForm';
import Expense from './Expense';
import DeleteGoal from './DeleteGoal';
import ExpenseEditForm from './ExpenseEditForm';
import '../App.css';

function GoalCard(props) {
	const [goal, setGoal] = useState({});
	const [showExpenses, setShowExpenses] = useState(false);
	const [showEdit, setShowEdit] = useState(false);
	const [showExpenseForm, setShowExpenseForm] = useState(false);
	const [showEditExpenseForm, setShowEditExpenseForm] = useState(false);
	const [deletedExpense, setDeletedExpense] = useState(false);
	const [showDeleteGoalForm, setShowDeleteGoalForm] = useState(false);
	const [deleted, setDeleted] = useState(null);
	const [currentExpenseForm, setCurrentExpenseForm] = useState('');

	async function sortByDate(goalObj) {
		let newExpensesList = [];
		let goalId = goalObj._id.toString();
		let userId = goalObj.userId;
		for (let i=0;i<goalObj.expenses.length;i++)
		{
			let expenseId = goalObj.expenses[i];
			let currentExpenseObj = await axios.get(`http://localhost:3000/user/${userId}/${goalId}/${expenseId}`);
			newExpensesList.push(currentExpenseObj.data.expense);
		}
		// console.log(newExpensesList);

        const sortedArray = newExpensesList.sort((a, b) => {
            const monthA = parseInt(a.date.substring(0,2));
            const dayA = parseInt(a.date.substring(3,5));
            const yearA = parseInt(a.date.substring(6));
            const monthB = parseInt(b.date.substring(0,2));
            const dayB = parseInt(b.date.substring(3,5));
            const yearB = parseInt(b.date.substring(6));

            if (yearA !== yearB)
            {
                return yearB - yearA;
            }
            if (monthA !== monthB)
            {
                return monthB - monthA;
            }
            if (dayA !== dayB)
            {
                return dayB - dayA;
            }
            return 0;
        });
		console.log(sortedArray)
		let expenseIdList = [];
		for (let i=0;i<sortedArray.length;i++)
		{
			expenseIdList.push(sortedArray[i]._id.toString());
		}
		goalObj.expenses = expenseIdList;
		// console.log(goalObj.expenses);
		// console.log(goalObj);
        return goalObj;
    }

	const deleteExpense = async (expenseId, goalId) => {
		try {
			// Delete an expense from a goal.
			let uid = doGetUID();
			let deletedExpense = await axios.delete(
				`http://localhost:3000/user/${uid}/${goalId}/${expenseId}`
			);
			console.log(deletedExpense);
		} catch (e) {
			console.log(e);
		}
		setDeletedExpense(true);
	};

	function openEdit() {
		setShowEdit(true);
	}
	function openExpense() {
		setShowExpenseForm(true);
	}

	function openEditExpense() {
		setShowEditExpenseForm(true);
	}

	function openDeleteGoal() {
		setShowDeleteGoalForm(true);
	}
	function handleClose() {
		setShowEdit(false);
		setShowExpenseForm(false);
		setShowDeleteGoalForm(false);
		setCurrentExpenseForm(false)
    	setShowEditExpenseForm(false);
	}
	async function deleteGoal(goalId) {
		let id = doGetUID();
		let data = await axios.delete(`http://localhost:3000/userProfile/${id}/${goalId}`);
		handleClose();
		setShowDeleteGoalForm(false);
	}

	useEffect(() => {
		setShowExpenses(false);
		setDeletedExpense(false);
		async function getGoalInfo() {
			let id = doGetUID();
			try {
				let data = await axios.get(`http://localhost:3000/userProfile/${id}/${props.id}`);
				let goal = data.data;
				setGoal(goal);

				// console.log(goal.title);
				// console.log(goal.expenses);
				let goalWithSortedExpenses = await sortByDate(goal);
				// console.log(goalWithSortedExpenses);
				setGoal(goalWithSortedExpenses);

				//we need to check if the curr date is past the goal date
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
				let dateOfGoal = data.data.goalDate.split('/');
				//0 = month, 1 = day, 2 = year
				if (currYear > parseInt(dateOfGoal[2])) {
					//if the current year is older than the goal year
					setGoal('expired');
				} else if (
					currYear === parseInt(dateOfGoal[2]) &&
					currMonth > parseInt(dateOfGoal[0])
				) {
					//if the year is the same, but month is older than goal month
					setGoal('expired');
				} else if (
					currYear === parseInt(dateOfGoal[2]) &&
					currMonth === parseInt(dateOfGoal[0]) &&
					currDay > parseInt(dateOfGoal[1])
				) {
					//if the year and month are the same, but day is older than goal day
					setGoal('expired');
				}

				if (data.data.expenses.length != 0) {
					setShowExpenses(true);
				}
				setDeleted(false);
			} catch (e) {
				setDeleted(true);
			}
		}
		getGoalInfo();
	}, [showEdit, showExpenseForm, deletedExpense, showDeleteGoalForm, showEditExpenseForm, currentExpenseForm]);

	if (goal === null || deleted === null) {
		return <>Loading...</>;
	} else if (goal === 'expired' || deleted === true) {
		return <></>;
	} else {
		goal.limit = (goal.limit).toString();
		if((goal.limit).includes(".")){
			goal.limit = parseFloat(goal.limit)
			if(goal.limit == (goal.limit).toFixed(1)){
				goal.limit = `${goal.limit}0`
			}
		}else{
			goal.limit = parseFloat(goal.limit)
		}
		return (
			<div className='goal-card'>
				<Grid item sm={4} md={3} lg={2.25} alignItems={'center'} key={props.id}>
					<Card
						variant="outlined"
						sx={{
							maxWidth: 700,
							height: 'auto',
							marginLeft: 'auto',
							marginRight: 'auto',
						}}
					>
						<div className='goal-buttons'>
							<button className='button' onClick={() => {openEdit();}}>Edit Goal</button>
							<button className='button' onClick={() => openDeleteGoal()}>Delete Goal</button>
						</div>

						<h2>{goal.title}</h2>
						<h3>Description: {goal.description}</h3>
						{/* <br /> */}
						<h4>Category: {goal.category}</h4>
						<h4>
							limit ${goal.limit} by {goal.goalDate}
						</h4>
						{showEdit && (
							<EditGoal isOpen={openEdit} close={handleClose} goal={goal._id} />
							)}					
						{showDeleteGoalForm && (
							// <DeleteGoal isOpen={openDeleteGoal} close={handleClose} goalId={goal._id} />
							<div>
								<p>Are you sure you want to delete?</p>
								<button className='button' onClick={() => deleteGoal(goal._id)}>Yes</button>
								<button className='button' onClick={() => handleClose()}>No</button>
							</div>
						)}
						<br/>
						<div className='expenses-list'>
							<h4>Expenses:</h4>
							{!showExpenses && (
								<h4>You do not have any expenses for this goal yet</h4>
							)
							}
							{showExpenses && (
								<>
									{goal.expenses.map((expense) => {
										// console.log(goal._id);
										// console.log('Expense: ', expense);
										return (
											<div key={expense}>
												<div>
													<Expense
														key={expense}
														expense={expense}
														goal={goal._id}
													/>
													<button
														onClick={() => {
															deleteExpense(expense, goal._id);
														}}
														style={{
															backgroundImage:
																'url("https://freepngimg.com/thumb/trash_can/164913-trash-free-clipart-hq.png")',
															backgroundSize: 'cover',
															backgroundRepeat: 'no-repeat',
															backgroundColor: 'transparent',
															cursor: 'pointer',
															border: 'none',
															width: '20px',
															height: '20px',
															margin: '10px',
														}}
													></button>
													<button
														onClick={() => {
															setCurrentExpenseForm(expense);
														}}
														style={{
															backgroundImage:
																'url("https://www.freeiconspng.com/thumbs/edit-icon-png/edit-new-icon-22.png")',
															backgroundSize: 'cover',
															backgroundRepeat: 'no-repeat',
															backgroundColor: 'transparent',
															cursor: 'pointer',
															border: 'none',
															width: '20px',
															height: '20px',
															margin: '10px',
														}}
													>
													</button>
													{currentExpenseForm == expense && (
														<ExpenseEditForm
															isOpen={openEditExpense}
															close={handleClose}
															goal={goal._id}
															expense={expense}
														/>
													)}
												</div>
											</div>
										);
									})}
								</>
							)}
							<button
							className='button'
							onClick={() => {
								openExpense();
							}}
							>
								Add Expense
							</button>
							{showExpenseForm && (
							<ExpenseForm
								isOpen={openExpense}
								close={handleClose}
								goalId={goal._id}
							/>
						)}
						</div>
						<br />
						<br />
					</Card>
				</Grid>
				<br />
			</div>
		);
	}
}

export default GoalCard;
