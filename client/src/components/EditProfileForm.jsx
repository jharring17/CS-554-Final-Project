import React, {useContext, useState} from 'react';
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        let category = document.getElementById('category').value;
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
          await axios.post(`http://localhost:3000/user/${fire_id}/addCategory`, 
                            {fire_id: fire_id, category: category})
        } 
        catch (error) {
          console.log(error);
          alert(error);
        }
        navigate('/account');
    };

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
                name='userName'
                id='userName'
                type='text'
                placeholder='username'
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
                id='email'
                type='email'
                placeholder='email'
                autoFocus={true}
                />
            </label>
            </div>

            <div className='form-group'>
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

export default CategoryForm;
