import React, {useState, useContext, useEffect} from "react"
import '../App.css';
import { doGetUID } from "../firebase/FirebaseFunctions";
import axios from "axios";

function DeleteCategory() {
    const [categories, setCategories] = useState([]);

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

  return (
    <div >
        <form>
            <label>
                Pick one: <select id="category" style={{marginTop: "3px", marginBottom: "8px", padding: "5px 10px"}}>
                    <option>...</option>
                    {categories.map((category) => {
                        return (
                            <option value={category} key={category}>
                            {category}
                        </option>
                        )
                    })}
                </select>
            </label>
        </form>
    </div>
  );
}

export default DeleteCategory;
