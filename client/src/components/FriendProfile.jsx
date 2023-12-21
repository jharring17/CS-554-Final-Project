import React, {useContext, useState, useEffect} from 'react';
import {useParams, Link} from 'react-router-dom';
import {doGetUID} from '../firebase/FirebaseFunctions';
import '../App.css';
import axios from 'axios';
import {AuthContext} from '../context/AuthContext';

function FriendProfile() {
    const {currentUser} = useContext(AuthContext);
    const [user, setUser] = useState(null);
    const [goalsCompleted, setGoalsCompleted] = useState(0);
    // const [goalsExpired, setGoalsExpired] = useState(0);
    const [notFriended, setNotFriended] = useState(false);
    const {fireId} = useParams();
    const [history, setHistory] = useState();

    // async function getGoalInfo(goal){
    //     let goalData = await axios.get(`http://localhost:3000/userProfile/${fireId}/${goal}`);
    //     return goalData.data
    // }
    
    useEffect( () => {
        setUser(null);
        async function getUserInfo(){
            let userData = await axios.get(`http://localhost:3000/user/${fireId}/getFriendInfo`)
            let currUser = doGetUID()
            if(currUser != fireId && !userData.data.friends.includes(currUser)) {setNotFriended(true); return}
            setUser(userData.data);
            if(userData.data.goals.length === 0){
                return
            }else{
                // let fire_id = currentUser.uid;
                const {data: userData} = await axios.get(`http://localhost:3000/getUserByFireAuth/${fireId}`)
                setUser(userData)
                const {data: historyData} = await axios.get(`http://localhost:3000/userProfile/${fireId}/history`)
                setHistory(historyData.history);
            }
        }
        getUserInfo();
    }, [])

    if (notFriended) return <div>You must be friends to see this page!</div>
    else if(user === null || fireId === undefined || history === undefined){
        return (
            <div>Loading...</div>
        )
    }
    else {
        const historySucceeded = history.reduce((total, item) => {if(item.successful == true) return total+1; else return total}, 0)
        return (
            <>
                <div className='card'>
                <h2>{user.displayName}</h2>
                <img src={user.profilePic} alt={`${user.username} profile pic`} style={{width:"120px", height:"120px", borderRadius: "100%" }}/>
                <p>{user.username}</p>
                <p>{user.displayName} has created a total of {user.goals.length} goals</p>
                <p> {user.displayName} has {(user.goals.length - history.length)} goals in progress</p>
                <p>Sucessfully completed {(historySucceeded / history.length * 100).toFixed(0)}% of past goals</p>
                </div>
                <br/>
                <Link to='/friends'>Back to Friends</Link>
            </>
          );
    }
}

export default FriendProfile;
