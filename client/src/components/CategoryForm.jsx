import React, {useContext, useState} from 'react';
import {AuthContext} from '../context/AuthContext';
import {doGetUID} from '../firebase/FirebaseFunctions';
import {useNavigate} from 'react-router-dom';
import '../App.css';
import axios from 'axios';

function CategoryForm(e) {
    const navigate = useNavigate();
    const {currentUser} = useContext(AuthContext);
    const [errorState, setErrorState] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        let category = document.getElementById('category').value;
        try {
          //category
          if(typeof category != 'string') throw `Category must be a string`;
          category = category.trim();
          if(category.length === 0) throw `Category cannot be empty`;
          category = category.toLowerCase();
          if (category.length > 30) {
            throw 'Category name too long: CategoryForm.jsx';
          }
          if (!/^[a-zA-Z0-9_.-]*[a-zA-Z][a-zA-Z0-9_. -]*$/.test(category)) { 
            //rn this takes multi word categories with numbers and _.-
            throw 'Invalid category: CategoryForm.jsx';
          }
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
    <form onSubmit={handleSubmit}>
        {errorState && <h4 className='error'>{errorState}</h4>}
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
