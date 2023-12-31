import React, {useState, useContext, useEffect} from "react"
import '../App.css';
import { doGetUID } from "../firebase/FirebaseFunctions";
import axios from "axios";

function DeleteCategory(props) {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);

    function stringChecker(string) {
        if(typeof string != 'string') throw `Input must be a string`;
        string = string.trim();
        if(string.length === 0) throw `String cannot be empty`;
        return string;
    }

    function checkCategory(category) {
        //checks if a category is a valid input (does not check if user already has that category)
        category = stringChecker(category);
        category = category.toLowerCase();
        if (category.length > 30) {
          throw 'Category name too long: checkCategory';
        }
        if (!/^[a-zA-Z0-9_.-]*[a-zA-Z][a-zA-Z0-9_. -]*$/.test(category)) { 
          //rn this takes multi word categories with numbers and _.-
          throw 'Invalid category';
        }
        return category;
    }

    useEffect( ()=>{
        async function getUserInfo(){
            let id = doGetUID();
            let data = await axios.get(`http://localhost:3000/user/${id}/getUserInfo`)
            setCategories(data.data.categories)
            console.log(id)
        }
        getUserInfo()
        }, []
    )

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null)
        
        let category = document.getElementById('category').value;
        
        try {
            category = checkCategory(category);
        }
        catch (e) {
            setError(e.toString());
            // alert(e.toString()); //shouldn't reach this bc dropdown
            return;
        }

        try {
            const fire_id = doGetUID();
            console.log(category)
            let deleted = await axios.post(`http://localhost:3000/user/${fire_id}/removeCategory`, 
                            {category: category})
        } 
        catch (error) {
            let errorStr = error.response.data.error;
            if (errorStr)
            {
                setError(errorStr);
            }
            else
            {
                setError(error.toString());
            }
        //   alert(errorStr); //shouldn't reach this bc dropdown
          return;
        }
        props.closeForm();
    };

  return (
    <div>
       {error && 
        <p className='error'>{error}</p>
        }
    <div >
        {categories.length > 3 ? 
            <form onSubmit={handleSubmit}>
            <label>
                Pick a custom category: <select id="category" style={{marginTop: "3px", marginBottom: "8px", padding: "5px 10px"}}>
                    {categories.map((category) => {
                        if (category != 'food' && category != 'entertainment' && category != 'utilities') {
                            return ( 
                                <option value={category} key={category}>
                                {category}    
                                </option>
                            )
                        }
                    })}
                </select>
            </label>
            <button className="button" type="submit">Delete category</button>
        </form>
        :
        <p>You have no custom categories to delete</p>
        }
    </div>
    </div>
  );
}

export default DeleteCategory;
