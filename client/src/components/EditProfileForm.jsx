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

    const [photo, setPhoto] = useState('');

    let displayName, username, email, profilePic;

    useEffect( () => {
        setUser(null)
        async function getUserInfo(){
            let id = doGetUID();
            let userData = await axios.get(`http://localhost:3000/user/${id}/getUserInfo`)
            setUser(userData.data);
        }
        getUserInfo();
        // console.log(user.data);
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();

        let newLink = "";
        if(photo[0] != undefined){
            let photoUploading = new FormData();
            //append the file custom key from cloudinary (gp0pimba)
            photoUploading.append("file", photo[0]);
            photoUploading.append("upload_preset", "gp0pimba");
            //upload the photo to cloudinary (djllvfvts is my cloud name)
            let data = await axios.post('https://api.cloudinary.com/v1_1/djllvfvts/image/upload', photoUploading)
            newLink = data.data.secure_url;
        }else{
            newLink = user.profilePic
        }


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
        //   let pic = document.getElementById('image').value;
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
        console.log(user)
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
                        onChange={(e) => setPhoto(e.target.files)}
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
