import React, {useContext, useState, useEffect} from 'react';
import {AuthContext} from '../context/AuthContext';
import {
    doGetUID,
    doPasswordReset
  } from '../firebase/FirebaseFunctions';
import {useNavigate, Link} from 'react-router-dom';
import '../App.css';
import axios from 'axios';
import ChangePassword from './ChangePassword';
import { getAuth, updateEmail, updateProfile, verifyBeforeUpdateEmail } from 'firebase/auth';

function CategoryForm({closeForm}) {
    // const navigate = useNavigate();
    const {currentUser} = useContext(AuthContext);
    const [errorState, setErrorState] = useState('');
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [photo, setPhoto] = useState('');

    let displayName, username, profilePic;
    const passwordReset = (event) => {
        event.preventDefault();
        console.log(user.email);
        // let email = document.getElementById('email').value;
        if (user.email) {
          doPasswordReset(user.email);
          alert('Password reset email was sent');
        } else {
          alert(
            'Please enter an email address below before you click the forgot password link'
          );
        }
      };

    function stringChecker(string, stringName) {
        if(typeof string != 'string') throw `${stringName} must be a string`;
        string = string.trim();
        if(string.length === 0) throw `${stringName} cannot be empty`;
        return string;
    }

    function checkName(name, stringName) {
        name = stringChecker(name, stringName);
    
        if (stringName.toLowerCase().trim() === "username") {
          name = name.toLowerCase();
          if (!(/^[a-zA-Z0-9]+$/.test(name)) || name.length < 8 || name.length > 20) {
            throw `Username is invalid`;
          }
        }
        else { //display name
          if (!(/^[a-zA-Z]+(?: [a-zA-Z]+)?$/.test(name)) || name.length < 8 || name.length > 20) {
            throw `Display name is invalid`;
          }
        }
        // else {
        //   throw `invalid input :: checkName`;
        // }
        
        return name;
    }

    // function checkEmail(emailVal) {
    //     let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    //     if (!emailVal) throw `You must supply an email`;
    //     if (typeof emailVal !== 'string')
    //         throw `Email should be a string`;
    //     emailVal = emailVal.trim();
    //     if (emailVal.length === 0)
    //         throw `Email cannot be an empty string or string with just spaces`;
    //     if (!emailVal.includes('@'))
    //         throw `Email is not a valid email`;
    //     if (!emailVal.match(mailformat))
    //         throw `Email is not a valid email`;
    //     return emailVal;
    // }
    
    useEffect( () => {
        setUser(null)
        async function getUserInfo(){
            let id = doGetUID();
            let userData = await axios.get(`http://54.175.184.234:3000/user/${id}/getUserInfo`)
            setUser(userData.data);
        }
        getUserInfo();
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();

        let newLink = "";
        if(photo != ''){
            let photoUploading = new FormData();
            //append the file custom key from cloudinary (gp0pimba)
            let splitPhotoName = photo.name.split('.');
            let fileType = splitPhotoName[splitPhotoName.length-1];
            if (fileType != "img" && fileType != "jpeg" && fileType != "png" && fileType != "jpg")
            {
                setError("Profile picture not valid file type");
                return;
            }
            else
            {
                photoUploading.append("file", photo);
                photoUploading.append("upload_preset", "gp0pimba");
                //upload the photo to cloudinary (djllvfvts is my cloud name)
                let data = await axios.post('https://api.cloudinary.com/v1_1/djllvfvts/image/upload', photoUploading)
                newLink = data.data.secure_url;
            }
        }else{
            newLink = user.profilePic
        }

        let hasErrors = false;
        let displayName = document.getElementById('displayName').value;
        let username = document.getElementById('username').value;
        // let email = document.getElementById('email').value;
        
        try {
            displayName = checkName(displayName, "displayName");
            username = checkName(username, "username");
            // email = checkEmail(email);
        }
        catch (e) {
            setError(e);
            hasErrors = true;
            return;
        }

        try {
          const fire_id = doGetUID();
          if (user.displayName === displayName.trim() && user.username === username.trim() 
             && photo === "") {
            setError("Must update at least one field to submit form");
            hasErrors = true;
            return;
          }
        //   //updating the data in firebase before updating the database
        //   const auth = getAuth();
        //   if(user.email != email.trim()){
        //     try{
        //         await updateEmail(auth.currentUser, email.trim())
        //     }catch(e){
        //         alert(e)
        //         setError("Email could not be updated");
        //         hasErrors = true;
        //         return
        //     }
        //   }
          await axios.post(`http://54.175.184.234:3000/userProfile/${fire_id}/editProfile`, 
                            {displayName: displayName.trim(),
                            username: username.trim(),
                            photo: newLink.trim()
                        })
        } 
        catch (error) {
            setError(error.response.data.error);
            console.log(error.response.data.error)
            return;
        }
        closeForm()
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
                {/* <Link to='/changePassword'>Change password</Link> */}
                <button className='forgotPassword' onClick={passwordReset}>
                    Change Password
                </button>
                <p></p>
                <form onSubmit={handleSubmit}>
                    {errorState && <h4 className='error'>{errorState}</h4>}
                    <div className='form-group'>
                    <label>
                        Display name:
                        <br />
                        <input style={{marginTop: "3px", marginBottom: "8px", padding: "5px 10px"}}
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
                        Min 8 characters, max 20 characters. Only letters. May include one space.
                    </p>
                    </div>
        
                    <div className='form-group'>
                    <label>
                        Username:
                        <br />
                        <input style={{marginTop: "3px", marginBottom: "8px", padding: "5px 10px"}}
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
                    {/* <label>
                        Email:
                        <br />
                        <input style={{marginTop: "3px", marginBottom: "8px", padding: "5px 10px"}}
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
                    </label> */}
                    </div>
                    <div className='form-group'>
                    <label >
                        Profile Pic:
                        <br />
                        <input style={{marginTop: "3px", marginBottom: "8px", padding: "5px 10px"}}
                        className='form-control'
                        type='file'
                        id="image"
                        name="image"
                        accept=".img,.jpeg,.png,.jpg"
                        autoFocus={true}
                        onChange={(e) => {
                            if (e == null || e.target == null || e.target.files == null)
                            {
                                setError("Must supply a valid file");
                            }
                            else
                            {
                                let currPhoto = e.target.files[0];
                                setPhoto(currPhoto)
                            }
                        }}
                        />
                    </label>
                    <p className="input-requirements">
                        .img, .jpeg, .png, .jpg
                    </p>
                    </div>

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
