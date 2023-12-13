import React, {useState, useEffect} from 'react';
import SignOutButton from './SignOut';
import {Link} from 'react-router-dom';
import '../App.css';
import ChangePassword from './ChangePassword';
import axios from 'axios';
import { doGetUID } from '../firebase/FirebaseFunctions';
import GoalCard from './GoalCard';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
} from '@mui/material';

function Account() {
  const [goals, setGoals] = useState([])
  const [userData, setUserData] = useState()
  
  useEffect(() => {
    async function getGoals(){
      let id = doGetUID();
      let data = await axios.get(`http://localhost:3000/userProfile/${id}`)
      setGoals(data.data)

      let userData = await axios.get(`http://localhost:3000/user/${id}/getUserInfo`)
      setUserData(userData.data)

    }
    getGoals()
  }, [])

  if(!userData){
    return (<>Loading...</>)
  }
  else{
    return (
      <>
        

        <div className='card'>
          <h2>Dashboard</h2>
          {/* <Card> */}
          <CardMedia
              component='img'
              image={userData.profilePic}
              title='art image'
              style={{ maxWidth: '200px', height: '200px', marginLeft: 'auto', marginRight: 'auto' }}
          />
        {/* </Card> */}
          <Link to='./createCategory'>Create Category</Link>
          <br/>
          <Link to='./makeGoal'>Add goal</Link>
          <br/>
          <Link>Report Expense</Link>
          <br/>
          <Link to='./editProfile'>Edit Profile</Link>
          <br/>
          {/* <ChangePassword /> */}
          <SignOutButton />
        </div>

        {(goals.length != 0) ? <div className='card'>
          {goals.map((goal) => {
            return <GoalCard key={goal._id} id={goal._id}/>
          })}
        </div> : <></>}
      </>
    );
  }
}

export default Account;
