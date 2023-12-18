import React, {useState, useContext, useEffect} from "react"
import '../App.css';
import { doGetUID } from "../firebase/FirebaseFunctions";
import axios from "axios";

function DeleteCategory(props) {
    const [categories, setCategories] = useState([]);

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
          throw 'category name too long: checkCategory';
        }
        if (!/^[a-zA-Z0-9_.-]*[a-zA-Z][a-zA-Z0-9_. -]*$/.test(category)) { 
          //rn this takes multi word categories with numbers and _.-
          throw 'invalid category';
        }
        return category;
    }

    useEffect( ()=>{
        async function getUserInfo(){
            let id = doGetUID();
            let data = await axios.get(`http://54.175.184.234:3000/user/${id}/getUserInfo`)
            setCategories(data.data.categories)
            console.log(id)
        }
        getUserInfo()
        }, []
    )

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let category = document.getElementById('category').value;
        
        try {
            category = checkCategory(category);
        }
        catch (e) {
            alert(e); //shouldn't reach this bc dropdown
            return;
        }

        try {
          const fire_id = doGetUID();
          console.log(category)
            let deleted = axios.post(`http://54.175.184.234:3000/user/${fire_id}/removeCategory`, 
                            {category: category})
        } 
        catch (error) {
          alert(error); //shouldn't reach this bc dropdown
          return;
        }
        props.closeForm();
    };

  return (
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
  );
}

export default DeleteCategory;
