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
    let newUsername;
    try {
      if (!displayName.value || !username.value || !email.value || !passwordOne.value || !passwordTwo.value || !age.value) {
        throw 'All input fields must be provided';
      }
      //Variable checks
      //display name
      let newDisplayName = displayName.value;
      if(typeof newDisplayName != 'string'){
        throw `Display Name must be a string`;

      }
      newDisplayName = newDisplayName.trim();
      if(newDisplayName.length === 0) throw `Display Name cannot be empty`;
      if (!(/^[a-zA-Z]+(?: [a-zA-Z]+)?$/.test(newDisplayName)) || newDisplayName.length < 8 || newDisplayName.length > 20) {
        throw `Display Name ${newDisplayName} is invalid`;
      }
      //username
      newUsername = username.value;
      if(typeof newUsername != 'string') throw `Username must be a string`;
      newUsername = newUsername.trim();
      if(newUsername.length === 0) throw `Username cannot be empty`;
      newUsername = newUsername.toLowerCase();
      if (!(/^[a-zA-Z0-9]+$/.test(newUsername)) || newUsername.length < 8 || newUsername.length > 20) {
        throw `Username ${newUsername} is invalid`;
      }
      //email
      let newEmail = email.value;
      if(typeof newEmail != 'string') throw `Email must be a string`;
      newEmail = newEmail.trim();
      if(newEmail.length === 0) throw `Email cannot be empty`;
      let isValid = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(newEmail);
      if (!isValid) {
        throw "Invalid email address";
      }
      //password 1
      let newPasswordOne = passwordOne.value;
      if (typeof newPasswordOne != 'string') {
        throw `Password must be a string`;
      }
      if (newPasswordOne.length === 0) {
        throw `Password cannot be empty`;
      }
      if (newPasswordOne.split(" ").length > 1) {
          throw `Password cannot contain spaces`;
      }
      if (newPasswordOne.length < 8) {
          throw `Password length must be at least 8`;
      }
      if (!/[A-Z]/.test(newPasswordOne)) {
          throw `Password must contain at least one uppercase character`;
      }
      if (!/\d/.test(newPasswordOne)) {
          throw `Password must contain at least one number`;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPasswordOne)) {
          throw `Password must contain at least one special character`;
      }
      //password 2
      let newPasswordTwo = passwordTwo.value;
      
      //age
      let newAge = age.value;
      if (Number.isNaN(Number(newAge)) || newAge < 13) {
        throw 'Invalid age';
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
      setErrorState(error.toString());
      return false;
    }
    let fire_id;
    try {
      const userExists =  await axios.get(`http://54.175.184.234:3000/user/${newUsername}/checkUsernameExists`);
    }
    catch (e) {
      setErrorState("User already exists with this username");
      return false;
    }
    try {
      const createdUser = await doCreateUserWithEmailAndPassword(email.value, passwordOne.value, displayName.value);
      console.log(createdUser);
      fire_id = doGetUID();
    }
    catch (error) {
      let errorString = error.toString();
      if (errorString.includes("auth/email-already-in-use"))
      {
        setErrorState("Account already exists with this email");
        return false;
      }
      else
      {
        setErrorState(errorString);
        return false;
      }
    }
    try {
      let isFireId = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$/.test(fire_id);
      if (!isFireId) {
        throw 'Not valid fire_id';
      }
    }
    catch (error) {
      console.log(error);
      // setErrorState(error);
      return false;
    }
    try {
      await axios.post(`http://54.175.184.234:3000/user/register`, 
                      {fire_id: fire_id,
                      displayName: displayName.value,
                      username: username.value,
                      email: email.value,
                      age: age.value})
      setSignedUp(true);
    } 
    catch (error) {
      setErrorState(error.response.data.e.toString());
      setSignedUp(false);
    }
  };

  if (signedUp && currentUser) {
    return <Navigate to='/feed' />;
  }

  return (
    <div className='card'>
      <h1>Sign up</h1>
      {errorState && <h4 className='error'>{errorState.toString()}</h4>}
      <form onSubmit={handleSignUp}>
        <div className='form-group'>
          <label>
            Display name:
            <br />
            <input
              className='form-control'
              // required
              name='displayName'
              type='text'
              placeholder='Name'
              autoFocus={true}
            />
          </label>
          <p className="input-requirements">
            Min 8 characters, max 20 characters. Only letters. May include one space.
          </p>
        </div>
        <div className='form-group'>
          <label>
            Email:
            <br />
            <input
              className='form-control'
              // required
              name='email'
              // type='email'
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
              // required
              name='username'
              type='text'
              placeholder='Username'
            />
          </label>
          <p className="input-requirements">
            Min 8 characters, max 20 characters. Only letters and numbers.
          </p>
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
              // required
            />
          </label>
          <p className="input-requirements">
            Min 8 characters. Must have at least 1 uppercase letter, 1 number, and 1 special character.
          </p>
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
              // required
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
              // required
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
