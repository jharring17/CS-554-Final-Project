import React from 'react';
import CategoryForm from './CategoryForm.jsx';
import {Link} from 'react-router-dom';
import '../App.css';

function ManageCategories() {
  return (
    <>
        <Link to='/account/createCategory'>Add category</Link>
        <br/>
        <Link to=''>Delete category</Link>
    </>
  );
}

export default ManageCategories;
