import React, {useContext, useState} from 'react';
import {AuthContext} from '../context/AuthContext';
import {doGetUID} from '../firebase/FirebaseFunctions';
import {useNavigate, Link} from 'react-router-dom';
import '../App.css';
import axios from 'axios';

function CategoryForm({closeForm}) {
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
            throw 'Category name too long';
          }
          if (!/^[a-zA-Z0-9_.-]*[a-zA-Z][a-zA-Z0-9_. -]*$/.test(category)) { 
            //rn this takes multi word categories with numbers and _.-
            throw 'Invalid category';
          }
        }
        catch (error)
        {
          setErrorState(error);
          return false;
        }
        try {
          const fire_id = doGetUID();
          await axios.post(`http://localhost:3000/user/${fire_id}/addCategory`, 
                            {fire_id: fire_id, category: category})
        } 
        catch (error) {
          setErrorState("This category already exists");
          return false;
        }
        closeForm();
    };

  return (
    <>
      <form onSubmit={handleSubmit}>
          {errorState && <h4 className='error'>{errorState}</h4>}
          <div className='form-group'>
            <h1>Add Category!</h1>
            <label>
              Category Name:
              <br />
              <input style={{marginTop: "3px", marginBottom: "8px", padding: "10px"}}
                className='form-control'
                required
                name='category'
                id='category'
                type='text'
                placeholder='Category'
                autoFocus={true}
              />
            </label>
            <p className="input-requirements">
            Max 30 characters. Only letters and _.-
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
      {/* <Link to='/account'>Back to Account</Link> */}
    </>
  );
}

export default CategoryForm;
