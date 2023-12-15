import { useEffect, useState, useContext } from "react"
import axios from "axios"
import { PropTypes } from "prop-types"
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { AuthContext } from "../context/AuthContext";
import { doGetUID } from "../firebase/FirebaseFunctions";

const backend = axios.create({baseURL: "http://localhost:3000"})

const HistoryItem = (props) => {
    const {currentUser} = useContext(AuthContext);
    const [itemData, setItemData] = useState(props.itemData)
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState({})
    const [expenses, setExpenses] = useState();

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
    });
    let passFailColor = "";
    let passFailString = "";
    if (totalExpenses > itemData.limit)
    {
        passFailColor = "red";
        passFailString = "Goal Failed";
    }
    else
    {
        passFailColor = "green";
        passFailString = "Goal Achieved";
    }
    return (
        <div className="card" style={{position: "relative", overflow: "hidden", border: `3px solid ${passFailColor}`, borderRadius: "12px"}}>
            <div className="user-feed-card" style={{display:"flex", gap:"15px", alignItems: "center", position: "absolute", top: 0, left: 0, boxSizing:"border-box", width: "100%", paddingLeft: "20px", paddingRight: "20px", paddingTop: "5px"}}>
                <h2>{itemData.title}</h2>
                <p style={{marginLeft:"auto", marginRight: 0}}>{itemData.goalDate}</p>
            </div>
            <div style={{marginTop: 50, marginBottom: 25, borderBottom: "2px solid black", borderTop: "2px solid black", paddingBottom: "5px", paddingTop: "15px"}}>
                <p style={{fontWeight: "bold", color: `${passFailColor}`}}>{passFailString}</p>
                <p style={{fontSize:"medium"}}>{itemData.description}</p>
                <p style={{margin: 0}}>Category: <span style={{fontWeight: "bold"}}>{itemData.category}</span></p>
                <p>Amount Spent: ${totalExpenses}</p>
                <p>Budget: ${itemData.limit}</p>
            </div>
            <div className="footer-feed-card" style={{display:"flex", gap:"5px", alignItems: "center", position: "absolute", bottom: 10, left: 10, height: "25px"}}>
                <p style={{marginLeft:"10px"}}>{(itemData.likes.length == 1) ? "1 like" : (itemData.likes.length == 0) ? "No likes" : `${itemData.likes.length} likes`}</p>
            </div>
        </div>
    )
}

HistoryItem.propTypes = {
    itemData: PropTypes.object.isRequired
}

export default HistoryItem