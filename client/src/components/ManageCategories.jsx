import React from 'react';
import CategoryForm from './CategoryForm.jsx';
import DeleteCategory from './DeleteCategory.jsx'
import {Link} from 'react-router-dom';
import '../App.css';

function ManageCategories({closeForm}) {
  const [tab, setTab] = useState(0)

  if(tab == 1) return <CategoryForm closeForm={closeForm}/>
  if(tab == 2) return <DeleteCategory closeForm={closeForm}/>

  return (
    <>
        <button onClick={()=>setTab(1)}>Add category</button>
        <button onClick={()=>setTab(2)}>Delete category</button>
    </>
  );
  
}

export default ManageCategories;
