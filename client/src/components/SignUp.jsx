import React, {useContext, useState} from 'react';
import {Navigate, Link} from 'react-router-dom';
import {doGetUID, doCreateUserWithEmailAndPassword} from '../firebase/FirebaseFunctions';
import {AuthContext} from '../context/AuthContext';
import axios from 'axios';

function SignUp() {
  const {currentUser} = useContext(AuthContext);
  const [errorState, setErrorState] = useState('');
  const [signedUp, setSignedUp] = useState('');
  const handleSignUp = async (e) => {
    e.preventDefault();
    setSignedUp(false);
    const {displayName, email, username, passwordOne, passwordTwo, age} = e.target.elements;
    try {
      if (!displayName.value || !username.value || !email.value || !passwordOne.value || !passwordTwo.value || !age.value) {
        throw 'All input fields must be provided :: SignUp.jsx';
      }
      //Variable checks
      //display name
      let newDisplayName = displayName.value;
      if(typeof newDisplayName != 'string'){
        throw `Input must be a string :: SignUp.jsx`;

      }
      newDisplayName = newDisplayName.trim();
      if(newDisplayName.length === 0) throw `String cannot be empty :: SignUp.jsx`;
      if (!(/^[a-zA-Z0-9]+$/.test(newDisplayName)) || newDisplayName.length < 8 || newDisplayName.length > 20) {
        throw `${newDisplayName} is invalid :: SignUp.jsx`;
      }
      //username
      let newUsername = username.value;
      if(typeof newUsername != 'string') throw `Input must be a string :: SignUp.jsx`;
      newUsername = newUsername.trim();
      if(newUsername.length === 0) throw `String cannot be empty :: SignUp.jsx`;
      newUsername = newUsername.toLowerCase();
      if (!(/^[a-zA-Z0-9]+$/.test(newUsername)) || newUsername.length < 8 || newUsername.length > 20) {
        throw `${newUsername} is invalid :: SignUp.jsx`;
      }
      //email
      let newEmail = email.value;
      if(typeof newEmail != 'string') throw `Input must be a string :: SignUp.jsx`;
      newEmail = newEmail.trim();
      if(newEmail.length === 0) throw `String cannot be empty :: SignUp.jsx`;
      let isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail);
      if (!isValid) {
        throw "Invalid email address :: SignUp.jsx";
      }
      //password 1
      let newPasswordOne = passwordOne.value;
      if (typeof newPasswordOne != 'string') {
        throw `Password must be a string :: SignUp.jsx`;
      }
      if (newPasswordOne.length === 0) {
        throw `Password cannot be empty :: SignUp.jsx`;
      }
      if (newPasswordOne.split(" ").length > 1) {
          throw `Password cannot contain spaces :: SignUp.jsx`;
      }
      if (newPasswordOne.length < 8) {
          throw `Password length must be at least 8 :: SignUp.jsx`;
      }
      if (!/[A-Z]/.test(newPasswordOne)) {
          throw `Password must contain at least one uppercase character :: SignUp.jsx`;
      }
      if (!/\d/.test(newPasswordOne)) {
          throw `Password must contain at least one number :: SignUp.jsx`;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPasswordOne)) {
          throw `Password must contain at least one special character :: SignUp.jsx`;
      }
      //password 2
      let newPasswordTwo = passwordTwo.value;
      if (typeof newPasswordTwo != 'string') {
        throw `Password must be a string :: SignUp.jsx`;
      }
      if (newPasswordTwo.length === 0) {
        throw `Password cannot be empty :: SignUp.jsx`;
      }
      if (newPasswordTwo.split(" ").length > 1) {
          throw `Password cannot contain spaces :: SignUp.jsx`;
      }
      if (newPasswordTwo.length < 8) {
          throw `Password length must be at least 8 :: SignUp.jsx`;
      }
      if (!/[A-Z]/.test(newPasswordTwo)) {
          throw `Password must contain at least one uppercase character :: SignUp.jsx`;
      }
      if (!/\d/.test(newPasswordTwo)) {
          throw `Password must contain at least one number :: SignUp.jsx`;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPasswordTwo)) {
          throw `Password must contain at least one special character :: SignUp.jsx`;
      }
      //age
      let newAge = age.value;
      if (Number.isNaN(Number(newAge)) || newAge < 13) {
        throw 'Invalid age :: SignUp.jsx';
      }
      newAge = parseInt(newAge);

      //passwords are equal
      if (passwordOne.value !== passwordTwo.value) {
        // setErrorState('Passwords do not match');
        throw 'Passwords do not match';
      }
    }
    catch (error)
    {
      console.log(error);
      setErrorState(error);
      // alert(error);
      return false;
    }
    let fire_id;
    try {
      console.log("Firebase call")
      const createdUser = await doCreateUserWithEmailAndPassword(email.value, passwordOne.value, displayName.value);
      console.log(createdUser);
      fire_id = doGetUID();
    }
    catch (error) {
      console.log(error);
      setErrorState(error);
      alert(error);
      return false;
    }
    try {
      let isFireId = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$/.test(fire_id);
      if (!isFireId) {
        throw 'Not valid fire_id: Signup.jsx';
      }
    }
    catch (error) {
      console.log(error);
      // setErrorState(error);
      alert(error);
      return false;
    }
    try {
      await axios.post(`http://localhost:3000/user/register`, 
                      {fire_id: fire_id,
                      displayName: displayName.value,
                      username: username.value,
                      password: passwordOne.value,
                      email: email.value,
                      age: age.value})
      setSignedUp(true);
    } 
    catch (error) {
      console.log(error);
      setErrorState(error);
      alert(error);
      setSignedUp(false);
    }
  };

  if (signedUp && currentUser) {
    return <Navigate to='/feed' />;
  }

  return (
    <div className='card'>
      <h1>Sign up</h1>
      {errorState && <h4 className='error'>{errorState}</h4>}
      <form onSubmit={handleSignUp}>
        <div className='form-group'>
          <label>
            Display name:
            <br />
            <input
              className='form-control'
              required
              name='displayName'
              type='text'
              placeholder='Name'
              autoFocus={true}
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
              type='email'
              placeholder='Email'
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
              type='text'
              placeholder='Username'
            />
          </label>
        </div>
        <div className='form-group'>
          <label>
            Password:
            <br />
            <input
              className='form-control'
              id='passwordOne'
              name='passwordOne'
              type='password'
              placeholder='Password'
              autoComplete='off'
              required
            />
          </label>
        </div>
        <div className='form-group'>
          <label>
            Confirm Password:
            <br />
            <input
              className='form-control'
              name='passwordTwo'
              type='password'
              placeholder='Confirm Password'
              autoComplete='off'
              required
            />
          </label>
        </div>
        <div className='form-group'>
          <label>
            Age:
            <br />
            <input
              className='form-control'
              name='age'
              type='number'
              placeholder='Age'
              autoComplete='off'
              required
            />
          </label>
        </div>
        <button
          className='button'
          id='submitButton'
          name='submitButton'
          type='submit'
        >
          Sign Up
        </button>
      </form>
      <Link className='forgotPassword' to='/'>
           Have an account? Sign-in
      </Link>
      <br />
    </div>
  );
}

export default SignUp;
