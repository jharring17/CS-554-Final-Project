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
    const [error, setError] = useState(null);
    const [photo, setPhoto] = useState('');

    let displayName, username, email, profilePic;

    function stringChecker(string) {
        if(typeof string != 'string') throw `Input must be a string`;
        string = string.trim();
        if(string.length === 0) throw `String cannot be empty`;
        return string;
    }

    function checkName(name, stringName) {
        name = stringChecker(name);
        if (stringName.toLowerCase().trim() === "username") {
          name = name.toLowerCase();
        }
        if (!(/^[a-zA-Z0-9]+$/.test(name)) || name.length < 8 || name.length > 20) {
          throw `${stringName} is invalid :: checkName`;
        }
        return name;
    }

    function checkEmail(email) {
        email = stringChecker(email);
        let isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!isValid) {
          throw "Invalid email address";
        }
        return email;
    };

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

        let newLink = "";
        if(photo != ''){
            console.log("here")
            let photoUploading = new FormData();
            //append the file custom key from cloudinary (gp0pimba)
            photoUploading.append("file", photo);
            photoUploading.append("upload_preset", "gp0pimba");
            //upload the photo to cloudinary (djllvfvts is my cloud name)
            let data = await axios.post('https://api.cloudinary.com/v1_1/djllvfvts/image/upload', photoUploading)
            newLink = data.data.secure_url;
        }else{
            newLink = user.profilePic
        }

        let hasErrors = false;
        let displayName = document.getElementById('displayName').value;
        let username = document.getElementById('username').value;
        let email = document.getElementById('email').value;
        
        try {
            displayName = checkName(displayName, "displayName");
            username = checkName(username, "username");
            email = checkEmail(email);
        }
        catch (e) {
            setError(e);
            hasErrors = true;
            return;
        }

        try {
          const fire_id = doGetUID();
          console.log("fireid", fire_id)
          await axios.post(`http://localhost:3000/userProfile/${fire_id}/editProfile`, 
                            {displayName: displayName,
                            username: username,
                            email: email,
                            photo: newLink
                        })
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
                {error && <p className='error'>{error}</p>}
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
                    <p className="input-requirements">
                        Min 8 characters, max 20 characters. Only letters and numbers.
                    </p>
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
                    <p className="input-requirements">
                        Min 8 characters, max 20 characters. Only letters and numbers.
                    </p>
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
                    <div className='form-group'>
                    <label >
                        Profile Pic:
                        <br />
                        <input
                        className='form-control'
                        type='file'
                        id="image"
                        name="image"
                        accept=".img,.jpeg,.png,.jpg"
                        autoFocus={true}
                        onChange={(e) => {
                            let currPhoto = e.target.files[0];
                            setPhoto(currPhoto)
                        }}
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
                
                <br/>
                <Link to='/account'>Back to Account</Link>
            </>
          );
    }
}

export default CategoryForm;
