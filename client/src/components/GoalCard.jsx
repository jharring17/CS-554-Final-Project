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
	const [showDeleteGoalForm, setShowDeleteGoalForm] =useState(false);
	const [deleted, setDeleted] = useState(null)

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
	}
	async function deleteGoal(goalId){
        let id = doGetUID();
        let data = await axios.delete(`http://localhost:3000/userProfile/${id}/${goalId}`)
		handleClose();
		setShowDeleteGoalForm(false)
    }
  
	useEffect(() => {
		setShowExpenses(false);
		setDeletedExpense(false);
		async function getGoalInfo() {
			let id = doGetUID();
			try{
				let data = await axios.get(`http://localhost:3000/userProfile/${id}/${props.id}`);
				setGoal(data.data);
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
				setDeleted(false)
			}catch(e){
				setDeleted(true)
			}
		}
		getGoalInfo();
	}, [showEdit, showExpenseForm, deletedExpense, showDeleteGoalForm, showEditExpenseForm]);

	if (goal === null || deleted === null) {
		return <>Loading...</>;
	} else if (goal === 'expired' || deleted === true) {
		return <></>
	} else {
		return (
			<>
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
						<h2>{goal.title}</h2>
						<h3>{goal.description}</h3>
						<br />
						<h4>Goal Category: {goal.category}</h4>
						<h4>
							I want to spend at most ${goal.limit} by {goal.goalDate}
						</h4>

						{showExpenses && (
							<>
								<h4>Expenses:</h4>
								{goal.expenses.map((expense) => {
									console.log(goal._id);
									console.log('Expense: ', expense);
									return (
										<div key={expense}>
											<div className="row">
												<Expense
													key={expense}
													expense={expense}
													goal={goal._id}
												/>
												<br />
												<button
													onClick={() => {
														deleteExpense(expense, goal._id);
													}}
													style={{
														backgroundImage:
															'url("https://cdn-icons-png.flaticon.com/512/535/535246.png")',
														backgroundSize: 'cover',
														backgroundRepeat: 'no-repeat',
														backgroundColor: 'white',
														cursor: 'pointer',
														border: 'none',
														width: '20px',
														height: '20px',
														margin: '10px',
													}}
												></button>
												<button
													onClick={() => {
														openEditExpense();
													}}
												>
													Edit
												</button>
												{showEditExpenseForm && (
													<ExpenseEditForm
														isOpen={openEditExpense}
														close={handleClose}
														goal={goal._id}
														expense={expense}
													/>
												)}
											</div>
											<br />
											<br />
										</div>
									);
								})}
							</>
						)}
						<button
							onClick={() => {
								openEdit();
							}}
						>
							Edit Goal
						</button>
						{showEdit && (
							<EditGoal isOpen={openEdit} close={handleClose} goal={goal._id} />
						)}

						<button
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
						<button onClick={() => openDeleteGoal()} >Delete Goal</button>
						{showDeleteGoalForm && 
							// <DeleteGoal isOpen={openDeleteGoal} close={handleClose} goalId={goal._id} />
							<div>
								<p>Are you sure you want to delete?</p>
								<button onClick={()=> deleteGoal(goal._id)}>Yes</button>
								<button onClick={()=>handleClose()}>No</button>
							</div>
						}
						<br />
						<br />
					</Card>
				</Grid>
				<br />
			</>
		);
	}
}

export default GoalCard;
