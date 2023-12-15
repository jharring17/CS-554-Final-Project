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

    const buttonStyle = {background: "#282c34", width: "20%", color: "white", padding: "10px", textDecoration: "none", fontWeight: '400', borderRadius: "10px"}
    return (
      <>
        

        <div className='card'>
          
          <h2 style={{marginBottom: "10px"}}>Dashboard</h2>

        <CardMedia
              component='img'
              image={userData.profilePic}
              title='art image'
              style={{ maxWidth: '200px', height: '200px', marginLeft: 'auto', marginRight: 'auto' }}
          />
        {/* </Card> */}
          {/* <ChangePassword /> */}
          <SignOutButton />

          <div className='mini-nav' style={{display: "flex", gap: "5px", marginTop: "15px"}}>
              <Link to='./createCategory' style={{...buttonStyle, marginLeft: "auto"}}>Create Category</Link>
              <br/>
              <Link to='./makeGoal' style={buttonStyle}>Add goal</Link>
              <br/>
              <Link to='./editProfile' style={buttonStyle}>Edit Profile</Link>
              <br/>
              <Link to='./history' style={{...buttonStyle, marginRight: "auto"}}>History</Link>
              <br/>
          </div>
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
