import React, {useState, useEffect} from 'react';
import SignOutButton from './SignOut';
import {Link} from 'react-router-dom';
import '../App.css';
import ChangePassword from './ChangePassword';
import axios from 'axios';
import { doGetUID } from '../firebase/FirebaseFunctions';
import GoalCard from './GoalCard';
import ManageCategories from './ManageCategories';
import AddGoal from './AddGoalForm';
import EditProfileForm from './EditProfileForm'
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
} from '@mui/material';
import History from './History';

function Account() {
  const [goals, setGoals] = useState([])
  const [userData, setUserData] = useState()
  const [openedForm, setOpenedForm] = useState(0)
  
  function sortByDate(list) {
    const sortedArray = list.sort((a, b) => {
        const monthA = parseInt(a.goalDate.substring(0,2));
        const dayA = parseInt(a.goalDate.substring(3,5));
        const yearA = parseInt(a.goalDate.substring(6));
        const monthB = parseInt(b.goalDate.substring(0,2));
        const dayB = parseInt(b.goalDate.substring(3,5));
        const yearB = parseInt(b.goalDate.substring(6));

        if (yearA !== yearB)
        {
            return yearA - yearB;
        }
        if (monthA !== monthB)
        {
            return monthA - monthB;
        }
        if (dayA !== dayB)
        {
            return dayA - dayB;
        }
        return 0;
    });
    return sortedArray;
}

  useEffect(() => {
    async function getGoals(){
      let id = doGetUID();
      let data = await axios.get(`http://localhost:3000/userProfile/${id}`)
      let sortedData = sortByDate(data.data);
      // setGoals(data.data)
      setGoals(sortedData)


      let userData = await axios.get(`http://localhost:3000/user/${id}/getUserInfo`)
      setUserData(userData.data)

    }
    getGoals()
  }, [openedForm])

  if(!userData){
    return (<>Loading...</>)
  }
  else{
    const buttonStyle = {background: "#282c34", width: "20%", color: "white", padding: "10px", textDecoration: "none", fontWeight: '400', borderRadius: "10px"}

    const overlay = (openedForm == 0) ? <></> : <div className='card'>
    {(openedForm == 1) ? <ManageCategories closeForm={()=>setOpenedForm(0)} /> : (openedForm == 2) ? <AddGoal closeForm={()=>setOpenedForm(0)} /> : (openedForm == 3) ? <EditProfileForm closeForm={()=>setOpenedForm(0)} /> : <></>}
    <p onClick={()=>setOpenedForm(0)}>Close</p>
    </div>

    return (
      <>
        <div className='card'>
          
          <h1 style={{marginBottom: "10px", fontSize: '45px', marginTop: "10px"}}>Dashboard</h1>

        <CardMedia
              component='img'
              image={userData.profilePic}
              title='profile picture'
              style={{ maxWidth: '200px', height: '200px', marginLeft: 'auto', marginRight: 'auto', borderRadius: '50%'}}
          />

        <h2 style={{margin: "10px 0"}}>{userData.displayName}</h2>
          <div className='mini-nav' style={{display: "flex", gap: "5px", marginTop: "15px"}}>
              <Link onClick={()=>setOpenedForm(1)} style={{...buttonStyle, marginLeft: "auto"}}>Manage Categories</Link>
              <Link onClick={()=>setOpenedForm(2)} style={buttonStyle}>Add goal</Link>
              <Link onClick={()=>setOpenedForm(3)} style={buttonStyle}>Edit Profile</Link>
              <Link to="./history" style={{...buttonStyle, marginRight: "auto"}}>History</Link> 
              
          </div>
        </div>
        
        {overlay}

        {(goals.length != 0) ? <div>
          {goals.map((goal) => {
            return <GoalCard key={goal._id} id={goal._id}/>
          })}
        </div> : <></>}
      </>
    );
  }
}

export default Account;
