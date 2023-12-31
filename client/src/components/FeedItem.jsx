import { useEffect, useState, useContext } from "react"
import axios from "axios"
import { PropTypes } from "prop-types"
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { AuthContext } from "../context/AuthContext";
import { doGetUID } from "../firebase/FirebaseFunctions";
import {Link} from 'react-router-dom';

const backend = axios.create({baseURL: "http://localhost:3000"})

const FeedItem = (props) => {
    const {currentUser} = useContext(AuthContext);
    const [itemData, setItemData] = useState(props.itemData)
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState({})
    const [expenses, setExpenses] = useState();

    const toggleLike = async () => {
        const {data} = await backend.post(`/user/${currentUser.uid}/${itemData._id}/like`)
        setItemData(data.updatedGoal)
    }

    useEffect( () =>{
        const getData = async () => {
            const {data: userData} = await backend.get(`/getUserByFireAuth/${itemData.userId}`)
            setUser(userData)
            setLoading(false)
        }
        const getExpenseData = async (goalId) => {
            let expenseValues = [];
            let uid = doGetUID();
            for(let i = 0; i < itemData.expenses.length; i++){
                let expenseData = await axios.get(`http://localhost:3000/user/${uid}/${goalId}/${itemData.expenses[i]}`)
                expenseValues.push(parseFloat(expenseData.data.expense.amount))
            }
            setExpenses(expenseValues)
        }
        getData()
        getExpenseData(itemData._id);
        }, []
    )
    if(loading || expenses === undefined) return (<p>Loading...</p>)

    let totalExpenses = 0;
    expenses.map((expense)=>{
        totalExpenses += expense;
    })
    return (
        <div className="card" style={{position: "relative", overflow: "hidden"}}>
            <div className="user-feed-card" style={{display:"flex", gap:"15px", alignItems: "center", position: "absolute", top: 0, left: 0, boxSizing:"border-box", width: "100%", paddingLeft: "20px", paddingRight: "20px", paddingTop: "5px"}}>
                <img alt={"profile picture"} src={user.profilePic} style={{width:"45px", height:"45px", borderRadius: "100%" }}/>
                <Link to={`/friends/userprofile/${user.fire_id}`} style={{color: "black", textDecoration: "none", fontWeight: 700}}>{user.displayName}</Link>
                <p style={{marginLeft:"auto", marginRight: 0}}>{itemData.goalDate}</p>
            </div>
            <div style={{marginTop: 50, marginBottom: 25, borderBottom: "2px solid black", borderTop: "2px solid black", paddingBottom: "5px", paddingTop: "15px"}}>
                <p style={{margin: 0}}>I have met my goal...</p>
                <p style={{fontSize:"large"}}>{itemData.title}</p>
                <p style={{fontSize:"medium"}}>Category: {itemData.category}</p>
                <p style={{fontSize:"medium"}}>Description: {itemData.description}</p>
                <p>I used {((totalExpenses/itemData.limit) * 100).toFixed(0)}% of my budget!</p>
            </div>
            <div className="footer-feed-card" style={{display:"flex", gap:"5px", alignItems: "center", position: "absolute", bottom: 10, left: 10, height: "25px"}}>
                <button style={{backgroundColor: "rgba(0,0,0,0)", border: "none", display:"inline-flex", fontSize:"25px"}} onClick={() => toggleLike()}>{(itemData.likes.includes(currentUser.uid)) ? <FavoriteIcon fontSize="inherit"/> : <FavoriteBorderIcon fontSize="inherit"/>}</button>
                <p>{(itemData.likes.length == 1) ? "1 like" : (itemData.likes.length == 0) ? "No likes" : `${itemData.likes.length} likes`}</p>
            </div>
        </div>
    )
}

FeedItem.propTypes = {
    itemData: PropTypes.object.isRequired
}

export default FeedItem