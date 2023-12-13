import React, {useContext, useState, useEffect} from 'react';
import {doGetUID} from '../firebase/FirebaseFunctions';
import '../App.css';
import axios from 'axios';

function FriendProfile() {

    const [user, setUser] = useState(null);

    useEffect( () => {
        setUser(null)
        async function getUserInfo(){
            let id = doGetUID();
            let userData = await axios.get(`http://localhost:3000/user/${id}/getUserInfo`)
            setUser(userData.data);
        }
        getUserInfo();
    }, [])

    if(user === null){
        return (
            <div>Loading...</div>
        )
    }
    else {
        return (
            <div className='card'>
              <h2>This is the profile page of your {user.displayName}</h2>
            </div>
          );
    }
}

export default FriendProfile;
