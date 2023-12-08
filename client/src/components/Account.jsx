import React, { useState } from 'react';
import SignOutButton from './SignOut';
import { Link } from 'react-router-dom';
import '../App.css';
import ChangePassword from './ChangePassword';
import axios from 'axios';
import { doGetUID } from '../firebase/FirebaseFunctions';
import GoalCard from './GoalCard';

function Account() {
  const [goals, setGoals] = useState([])
  async function getGoals(){
    let id = doGetUID();
    let data = await axios.get(`http://localhost:3000/userProfile/${id}`)
    setGoals(data.data)
  }

  getGoals()
  return (
      <>
        <div className='card'>
          <h2>Dashboard</h2>
          <Link to='/createCategory'>Create Category</Link>
          <br/>
          <Link to='/makeGoal'>Add goal</Link>
          <br/>
          <Link>Report Expense</Link>
          <br/>
          <Link>Edit Profile</Link>
          <br/>
          {/* <ChangePassword /> */}
          <SignOutButton />
        </div>

        <div className='card'>

        {goals.map((goal) => {
          return <GoalCard key={goal._id} id={goal._id}/>
        })}
        </div>
      </>

  );
}

export default Account;
