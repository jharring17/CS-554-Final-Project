import React, {useContext, useState} from 'react';
import {AuthContext} from '../context/AuthContext';
import {doGetUID} from '../firebase/FirebaseFunctions';
import {useNavigate} from 'react-router-dom';
import '../App.css';
import axios from 'axios';

function CategoryForm(e) {
    const navigate = useNavigate();
    const {currentUser} = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        let category = document.getElementById('category').value;
        try {
          const fire_id = doGetUID();
          console.log("fireid", fire_id)
          await axios.post(`http://localhost:3000/user/fire_id/addCategory`, 
                            {fire_id: fire_id, category: category})
        } 
        catch (error) {
          console.log(error);
          alert(error);
        }
        navigate('/account');
    };

  return (
    <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label>
            Enter a category you would like to add:
            <br />
            <input
              className='form-control'
              required
              name='category'
              id='category'
              type='text'
              placeholder='category'
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
  );
}

export default CategoryForm;
