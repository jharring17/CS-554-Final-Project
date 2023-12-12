import React, {useContext, useState, useEffect} from 'react';
import {AuthContext} from '../context/AuthContext';
import {doGetUID} from '../firebase/FirebaseFunctions';
import {useNavigate, Link} from 'react-router-dom';
import '../App.css';
import axios from 'axios';
import ChangePassword from './ChangePassword';

function CategoryForm(e) {
    const navigate = useNavigate();
    const {currentUser} = useContext(AuthContext);
    const [errorState, setErrorState] = useState('');
    const [user, setUser] = useState(null);

    let displayName, username, email;

    useEffect( () => {
        setUser(null)
        async function getUserInfo(){
            let id = doGetUID();
            let userData = await axios.get(`http://localhost:3000/user/${id}/getUserInfo`)
            setUser(userData.data);
        }
        getUserInfo();
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        let displayName = document.getElementById('displayName').value;
        let username = document.getElementById('username').value;
        let email = document.getElementById('email').value;
        // let age = document.getElementById('age').value;

        try {
          //error check
        }
        catch (error)
        {
          console.log(error);
          setErrorState(error);
          return false;
        }
        try {
          const fire_id = doGetUID();
          console.log("fireid", fire_id)
          await axios.post(`http://localhost:3000/userProfile/${fire_id}/editProfile`, 
                            {displayName: displayName,
                            username: username,
                            email: email})
        } 
        catch (error) {
          console.log(error);
          alert(error);
        }
        navigate('/account');
    };

    if(user === null){
        return (
            <div>Loading...</div>
        )
    }
    else {
        return (
            <>
                <Link to='/changePassword'>Change password</Link>
                <p></p>
                <form onSubmit={handleSubmit}>
                    {errorState && <h4 className='error'>{errorState}</h4>}
                    <div className='form-group'>
                    <label>
                        Display name:
                        <br />
                        <input
                        className='form-control'
                        required
                        name='displayName'
                        id='displayName'
                        type='text'
                        placeholder='display name'
                        autoFocus={true}
                        ref={(node) => {
                            displayName = node;
                        }}
                        defaultValue={user.displayName}
                        />
                    </label>
                    </div>
        
                    <div className='form-group'>
                    <label>
                        Username:
                        <br />
                        <input
                        className='form-control'
                        required
                        name='username'
                        id='username'
                        type='text'
                        placeholder='username'
                        autoFocus={true}
                        ref={(node) => {
                            username = node;
                        }}
                        defaultValue={user.username}
                        />
                    </label>
                    </div>
        
                    <div className='form-group'>
                    <label>
                        Email:
                        <br />
                        <input
                        className='form-control'
                        required
                        name='email'
                        id='email'
                        type='email'
                        placeholder='email'
                        autoFocus={true}
                        ref={(node) => {
                            email = node;
                        }}
                        defaultValue={user.email}
                        />
                    </label>
                    </div>
        
                    {/* <div className='form-group'>
                    <label>
                        Age:
                        <br />
                        <input
                        className='form-control'
                        required
                        name='age'
                        id='age'
                        type='number'
                        placeholder='age'
                        autoFocus={true}
                        />
                    </label>
                    </div> */}
        
                    <button
                    className='button'
                    id='submitButton'
                    name='submitButton'
                    type='submit'
                    >
                    Submit
                    </button>
                </form>
            </>
          );
    }
}

export default CategoryForm;
