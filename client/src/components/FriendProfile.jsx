import React, {useContext, useState, useEffect} from 'react';
import {useParams, Link} from 'react-router-dom';
import {doGetUID} from '../firebase/FirebaseFunctions';
import '../App.css';
import axios from 'axios';

function FriendProfile() {
    const [user, setUser] = useState(null);
    const {fireId} = useParams();

    useEffect( () => {
        setUser(null);

        async function getUserInfo(){
            let userData = await axios.get(`http://localhost:3000/user/${fireId}/getUserInfo`)
            setUser(userData.data);
        }
        getUserInfo();
    }, [])

    if(user === null || fireId === undefined){
        return (
            <div>Loading...</div>
        )
    }
    else {
        return (
            <>
                <div className='card'>
                <h2>{user.displayName}</h2>
                <img src={user.profilePic} alt={`${user.username} profile pic`} style={{width:"120px", height:"120px", borderRadius: "100%" }}/>
                <p>{user.username}</p>
                <p>{user.email}</p>
                <p>{user.age}</p>
                </div>
                <br/>
                <Link to='/friends'>Back to Friends</Link>
            </>
          );
    }
}

export default FriendProfile;
