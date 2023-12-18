import React, {useContext, useState, useEffect} from 'react';
import {useParams, Link} from 'react-router-dom';
import {doGetUID} from '../firebase/FirebaseFunctions';
import '../App.css';
import axios from 'axios';

function FriendProfile() {
    const [user, setUser] = useState(null);
    const [goalsCompleted, setGoalsCompleted] = useState(0);
    const [goalsExpired, setGoalsExpired] = useState(0);
    const {fireId} = useParams();

    async function getGoalInfo(goal){
        let goalData = await axios.get(`http://54.175.184.234:3000//userProfile/${fireId}/${goal}`);
        return goalData.data
    }
    
    useEffect( () => {
        setUser(null);
        async function getUserInfo(){
            let userData = await axios.get(`http://54.175.184.234:3000//user/${fireId}/getFriendInfo`)
            setUser(userData.data);
            if(userData.data.goals.length === 0){
                return
            }else{
                for(let i = 0; i < userData.data.goals.length; i++){
                    let currGoal = await getGoalInfo(userData.data.goals[i])
                    if(currGoal.successful === true){
                        let tempCompleted = goalsCompleted;
                        tempCompleted += 1;
                        setGoalsCompleted(tempCompleted)
                    }

                    let date = currGoal.goalDate
                    let dateArr = date.split('/')     
                    console.log(dateArr)               
                    let currDate = new Date();
                    let month = currDate.getMonth() + 1;
                    let day = currDate.getDate();
                    let year = currDate.getFullYear();
                    if(year > dateArr[2]){
                        setGoalsExpired(goalsExpired + 1);
                    }else if(year <= dateArr[2] && month > dateArr[0]){
                        setGoalsExpired(goalsExpired + 1);
                    }else if(year <= dateArr[2] && month <= dateArr[0] && day > dateArr[1]){
                        setGoalsExpired(goalsExpired + 1)
                    }
                }
            }
        }
        getUserInfo();
    }, [])
    if(user === null || fireId === undefined ){
        return (
            <div>Loading...</div>
        )
    }
    else {
        console.log(goalsCompleted)
        
        return (
            <>
                <div className='card'>
                <h2>{user.displayName}</h2>
                <img src={user.profilePic} alt={`${user.username} profile pic`} style={{width:"120px", height:"120px", borderRadius: "100%" }}/>
                <p>{user.username}</p>
                <p>{user.displayName} has created a total of {user.goals.length} goals</p>
                <p> {user.displayName} has {(user.goals.length - goalsExpired)} goals in progress</p>
                {(goalsCompleted) ? <p>{user.displayName} has completed {((goalsCompleted/goalsExpired)*100).toFixed(0)}% of past goals</p> : <></>}
                </div>
                <br/>
                <Link to='/friends'>Back to Friends</Link>
            </>
          );
    }
}

export default FriendProfile;
