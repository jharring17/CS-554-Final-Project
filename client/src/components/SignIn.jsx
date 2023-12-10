import React, {useContext, useState} from 'react';
import {Navigate, Link} from 'react-router-dom';
import {AuthContext} from '../context/AuthContext';
import {
  doGetUID,
  doSignInWithEmailAndPassword,
  doPasswordReset
} from '../firebase/FirebaseFunctions';

function SignIn() {
  const {currentUser} = useContext(AuthContext);
  const [errorState, setErrorState] = useState('');
  const [signedIn, setSignedIn] = useState('');
  const handleLogin = async (event) => {
    event.preventDefault();
    setSignedIn(false);
    let {email, password} = event.target.elements;

    try {
      //email
      let newEmail = email.value;
      if(typeof newEmail != 'string') throw `Input must be a string :: SignIn.jsx`;
      newEmail = newEmail.trim();
      if(newEmail.length === 0) throw `String cannot be empty :: SignIn.jsx`;
      let isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail);
      if (!isValid) {
        throw "Invalid email address :: SignIn.jsx";
      }
      //password
      let newPassword = password.value;
      if (typeof newPassword != 'string') {
        throw `Password must be a string :: SignIn.jsx`;
      }
      if (newPassword.length === 0) {
        throw `Password cannot be empty :: SignIn.jsx`;
      }
      if (newPassword.split(" ").length > 1) {
          throw `Password cannot contain spaces :: SignIn.jsx`;
      }
      if (newPassword.length < 8) {
          throw `Password length must be at least 8 :: SignIn.jsx`;
      }
      if (!/[A-Z]/.test(newPassword)) {
          throw `Password must contain at least one uppercase character :: SignIn.jsx`;
      }
      if (!/\d/.test(newPassword)) {
          throw `Password must contain at least one number :: SignIn.jsx`;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
          throw `Password must contain at least one special character :: SignIn.jsx`;
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
      const createdUser = await doSignInWithEmailAndPassword(email.value, password.value);
      console.log(createdUser);
      fire_id = doGetUID();
    } catch (error) {
      alert(error);
    }
    try {
      let isFireId = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$/.test(fire_id);
      if (!isFireId) {
        throw 'Not valid fire_id: SignIn.jsx';
      }
      setSignedIn(true);
    }
    catch (error) {
      console.log(error);
      // setErrorState(error);
      alert(error);
      setSignedIn(false);
      return false;
      
    }
  };

  const passwordReset = (event) => {
    event.preventDefault();
    let email = document.getElementById('email').value;
    if (email) {
      doPasswordReset(email);
      alert('Password reset email was sent');
    } else {
      alert(
        'Please enter an email address below before you click the forgot password link'
      );
    }
  };
  if (signedIn && currentUser) {
    return <Navigate to='/feed' />;
  }
  return (
    <div>
      <div className='card'>
        <h1>Log-In</h1>
        {errorState && <h4 className='error'>{errorState}</h4>}
        <form className='form' onSubmit={handleLogin}>
          <div className='form-group'>
            <label>
              Email Address:
              <br />
              <input
                name='email'
                id='email'
                type='email'
                placeholder='Email'
                required
                autoFocus={true}
              />
            </label>
          </div>
          <br />
          <div className='form-group'>
            <label>
              Password:
              <br />
              <input
                name='password'
                type='password'
                placeholder='Password'
                autoComplete='off'
                required
              />
            </label>
          </div>

          <button className='button' type='submit'>
            Log in
          </button>

          <button className='forgotPassword' onClick={passwordReset}>
            Forgot Password
          </button>
        </form>

        <Link className='forgotPassword' to='/signup'>
            Don't have an account? Sign-up
        </Link>

        <br />
      </div>
    </div>
  );
}

export default SignIn;
