import React, { useState } from 'react';
import CategoryForm from './CategoryForm.jsx';
import DeleteCategory from './DeleteCategory.jsx'
import {Link} from 'react-router-dom';
import '../App.css';

function ManageCategories({closeForm}) {
  const [tab, setTab] = useState(0)

  if(tab == 1) return <CategoryForm closeForm={closeForm}/>
  if(tab == 2) return <DeleteCategory closeForm={closeForm}/>

  return (
    <div style={{display: "flex", gap: "10px"}}>
        <button style={{backgroundColor: "#282c34", color: "white", border: "none", borderRadius: "10px", padding: "10px 20px", width: "40%", marginLeft: "auto"}} onClick={()=>setTab(1)}>Add category</button>
        <button style={{backgroundColor: "#282c34", color: "white", border: "none", borderRadius: "10px", padding: "10px 20px", width: "40%", marginRight: "auto"}} onClick={()=>setTab(2)}>Delete category</button>
    </div>
  );
  
}

export default ManageCategories;
